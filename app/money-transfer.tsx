import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ScrollView,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  initializeVodafoneCashTransfer,
  initializeCardTransfer,
  initializeBankTransfer,
  getTransferFees,
  type TransferMethod,
  type MoneyTransfer,
} from '@/lib/money-transfer-service';

interface TransferMethodOption {
  id: TransferMethod;
  name: string;
  icon: string;
  description: string;
}

const TRANSFER_METHODS: TransferMethodOption[] = [
  {
    id: 'vodafone_cash',
    name: 'فودافون كاش',
    icon: '📱',
    description: 'تحويل فوري عبر فودافون كاش',
  },
  {
    id: 'card',
    name: 'بطاقة ائتمان/خصم',
    icon: '💳',
    description: 'تحويل عبر بطاقة Visa أو Mastercard',
  },
  {
    id: 'bank_transfer',
    name: 'تحويل بنكي',
    icon: '🏦',
    description: 'تحويل مباشر إلى حساب بنكي',
  },
  {
    id: 'digital_wallet',
    name: 'محفظة رقمية',
    icon: '💰',
    description: 'تحويل عبر المحافظ الرقمية',
  },
];

export default function MoneyTransferScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [step, setStep] = useState<'method' | 'recipient' | 'amount' | 'confirm'>(
    'method'
  );
  const [selectedMethod, setSelectedMethod] = useState<TransferMethod | null>(null);
  const [recipientInfo, setRecipientInfo] = useState('');
  const [amount, setAmount] = useState('');
  const [fee, setFee] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [transfer, setTransfer] = useState<MoneyTransfer | null>(null);

  const handleMethodSelect = (method: TransferMethod) => {
    setSelectedMethod(method);
    setStep('recipient');
  };

  const handleRecipientNext = () => {
    if (!recipientInfo.trim()) return;
    setStep('amount');
  };

  const handleAmountChange = async (value: string) => {
    setAmount(value);
    if (value && selectedMethod) {
      const feeData = await getTransferFees(selectedMethod, parseFloat(value));
      if (feeData) {
        setFee(feeData.fee);
      }
    }
  };

  const handleAmountNext = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setStep('confirm');
  };

  const handleConfirmTransfer = async () => {
    if (!selectedMethod || !recipientInfo || !amount) return;

    setIsLoading(true);
    try {
      let result: MoneyTransfer | null = null;

      if (selectedMethod === 'vodafone_cash') {
        result = await initializeVodafoneCashTransfer(
          recipientInfo,
          parseFloat(amount)
        );
      } else if (selectedMethod === 'card') {
        result = await initializeCardTransfer(recipientInfo, parseFloat(amount), '');
      } else if (selectedMethod === 'bank_transfer') {
        result = await initializeBankTransfer(
          'Recipient Name',
          recipientInfo,
          'Bank Name',
          parseFloat(amount)
        );
      }

      if (result) {
        setTransfer(result);
      }
    } catch (error) {
      console.error('[Money Transfer] Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMethodStep = () => (
    <View style={styles.stepContainer}>
      <ThemedText type="subtitle" style={styles.stepTitle}>
        اختر طريقة التحويل
      </ThemedText>
      <FlatList
        data={TRANSFER_METHODS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleMethodSelect(item.id)}
            style={[styles.methodCard, { backgroundColor: colors.surface }]}
          >
            <ThemedText style={styles.methodIcon}>{item.icon}</ThemedText>
            <View style={styles.methodInfo}>
              <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
              <ThemedText style={styles.methodDescription}>
                {item.description}
              </ThemedText>
            </View>
            <ThemedText style={styles.arrow}>›</ThemedText>
          </Pressable>
        )}
        scrollEnabled={false}
        contentContainerStyle={styles.methodsList}
      />
    </View>
  );

  const renderRecipientStep = () => (
    <View style={styles.stepContainer}>
      <ThemedText type="subtitle" style={styles.stepTitle}>
        معلومات المستقبل
      </ThemedText>
      <View style={styles.formGroup}>
        <ThemedText style={styles.label}>
          {selectedMethod === 'vodafone_cash'
            ? 'رقم الهاتف'
            : selectedMethod === 'bank_transfer'
            ? 'رقم الحساب البنكي'
            : 'البريد الإلكتروني'}
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: colors.background,
            },
          ]}
          placeholder={
            selectedMethod === 'vodafone_cash'
              ? '+20 123 456 7890'
              : selectedMethod === 'bank_transfer'
              ? 'IBAN or Account Number'
              : 'example@email.com'
          }
          placeholderTextColor={colors.icon}
          value={recipientInfo}
          onChangeText={setRecipientInfo}
          keyboardType={
            selectedMethod === 'vodafone_cash' ? 'phone-pad' : 'default'
          }
        />
      </View>
      <Pressable
        onPress={handleRecipientNext}
        disabled={!recipientInfo.trim()}
        style={[
          styles.button,
          {
            backgroundColor: recipientInfo.trim() ? colors.tint : colors.border,
          },
        ]}
      >
        <ThemedText style={styles.buttonText}>التالي</ThemedText>
      </Pressable>
    </View>
  );

  const renderAmountStep = () => (
    <View style={styles.stepContainer}>
      <ThemedText type="subtitle" style={styles.stepTitle}>
        المبلغ المراد تحويله
      </ThemedText>
      <View style={styles.formGroup}>
        <ThemedText style={styles.label}>المبلغ (جنيه مصري)</ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: colors.background,
            },
          ]}
          placeholder="أدخل المبلغ"
          placeholderTextColor={colors.icon}
          value={amount}
          onChangeText={handleAmountChange}
          keyboardType="decimal-pad"
        />
      </View>

      {amount && (
        <View
          style={[
            styles.feeContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.feeRow}>
            <ThemedText>المبلغ:</ThemedText>
            <ThemedText type="defaultSemiBold">{amount} ج.م</ThemedText>
          </View>
          <View style={styles.feeRow}>
            <ThemedText>العمولة:</ThemedText>
            <ThemedText type="defaultSemiBold">{fee} ج.م</ThemedText>
          </View>
          <View
            style={[
              styles.feeRow,
              { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: Spacing.md },
            ]}
          >
            <ThemedText type="defaultSemiBold">الإجمالي:</ThemedText>
            <ThemedText type="defaultSemiBold" style={{ color: colors.tint }}>
              {(parseFloat(amount) + fee).toFixed(2)} ج.م
            </ThemedText>
          </View>
        </View>
      )}

      <Pressable
        onPress={handleAmountNext}
        disabled={!amount || parseFloat(amount) <= 0}
        style={[
          styles.button,
          {
            backgroundColor:
              amount && parseFloat(amount) > 0 ? colors.tint : colors.border,
          },
        ]}
      >
        <ThemedText style={styles.buttonText}>التالي</ThemedText>
      </Pressable>
    </View>
  );

  const renderConfirmStep = () => (
    <View style={styles.stepContainer}>
      <ThemedText type="subtitle" style={styles.stepTitle}>
        تأكيد التحويل
      </ThemedText>
      <View
        style={[
          styles.confirmContainer,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.confirmRow}>
          <ThemedText>طريقة التحويل:</ThemedText>
          <ThemedText type="defaultSemiBold">
            {TRANSFER_METHODS.find((m) => m.id === selectedMethod)?.name}
          </ThemedText>
        </View>
        <View style={styles.confirmRow}>
          <ThemedText>المستقبل:</ThemedText>
          <ThemedText type="defaultSemiBold">{recipientInfo}</ThemedText>
        </View>
        <View style={styles.confirmRow}>
          <ThemedText>المبلغ:</ThemedText>
          <ThemedText type="defaultSemiBold">{amount} ج.م</ThemedText>
        </View>
        <View style={styles.confirmRow}>
          <ThemedText>العمولة:</ThemedText>
          <ThemedText type="defaultSemiBold">{fee} ج.م</ThemedText>
        </View>
        <View
          style={[
            styles.confirmRow,
            {
              borderTopWidth: 1,
              borderTopColor: colors.border,
              paddingTop: Spacing.md,
            },
          ]}
        >
          <ThemedText type="defaultSemiBold">الإجمالي:</ThemedText>
          <ThemedText type="defaultSemiBold" style={{ color: colors.tint }}>
            {(parseFloat(amount) + fee).toFixed(2)} ج.م
          </ThemedText>
        </View>
      </View>

      <Pressable
        onPress={handleConfirmTransfer}
        disabled={isLoading}
        style={[
          styles.button,
          {
            backgroundColor: isLoading ? colors.border : colors.tint,
          },
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText style={styles.buttonText}>تأكيد التحويل</ThemedText>
        )}
      </Pressable>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.successContainer}>
        <ThemedText style={styles.successIcon}>✓</ThemedText>
        <ThemedText type="title" style={styles.successTitle}>
          تم التحويل بنجاح!
        </ThemedText>
        <ThemedText style={styles.successMessage}>
          تم تحويل {amount} ج.م إلى {recipientInfo}
        </ThemedText>
      </View>

      <Pressable
        onPress={() => router.back()}
        style={[styles.button, { backgroundColor: colors.tint }]}
      >
        <ThemedText style={styles.buttonText}>العودة</ThemedText>
      </Pressable>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, Spacing.lg),
          paddingBottom: Math.max(insets.bottom, Spacing.lg),
        },
      ]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <ThemedText style={styles.backButton}>←</ThemedText>
          </Pressable>
          <ThemedText type="title">تحويل أموال</ThemedText>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {(['method', 'recipient', 'amount', 'confirm'] as const).map(
            (s, index) => (
              <View
                key={s}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor:
                      (['method', 'recipient', 'amount', 'confirm'].indexOf(step) >=
                      index)
                        ? colors.tint
                        : colors.border,
                  },
                ]}
              />
            )
          )}
        </View>

        {/* Content */}
        {transfer ? (
          renderSuccessStep()
        ) : step === 'method' ? (
          renderMethodStep()
        ) : step === 'recipient' ? (
          renderRecipientStep()
        ) : step === 'amount' ? (
          renderAmountStep()
        ) : (
          renderConfirmStep()
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  backButton: {
    fontSize: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.lg,
  },
  stepTitle: {
    marginBottom: Spacing.md,
  },
  methodsList: {
    gap: Spacing.md,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.large,
    gap: Spacing.md,
  },
  methodIcon: {
    fontSize: 32,
  },
  methodInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  methodDescription: {
    fontSize: 12,
    opacity: 0.6,
  },
  arrow: {
    fontSize: 20,
    opacity: 0.5,
  },
  formGroup: {
    gap: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.medium,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 14,
    textAlign: 'right',
  },
  feeContainer: {
    borderWidth: 1,
    borderRadius: BorderRadius.medium,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmContainer: {
    borderWidth: 1,
    borderRadius: BorderRadius.medium,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.lg,
  },
  successIcon: {
    fontSize: 64,
    color: '#34C759',
  },
  successTitle: {
    fontSize: 24,
    color: '#34C759',
  },
  successMessage: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
});
