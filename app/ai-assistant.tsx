import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getAIResponse, getWorkerRecommendations } from '@/lib/ai-assistant';
import type { AIResponse } from '@/lib/ai-assistant';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const QUICK_QUESTIONS = [
  'كيف أجد عامل كهربائي بالقرب مني؟',
  'ما هي أفضل طريقة لاختيار العامل المناسب؟',
  'كيف أتواصل مع العامل بأمان؟',
  'ما هي طرق الدفع المتاحة؟',
];

export default function AIAssistantScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'مرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Get AI response
      const aiResponse = await getAIResponse(inputText);

      const aiMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        type: 'ai',
        content: aiResponse.message,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('[AI Assistant] Error:', error);
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        type: 'ai',
        content: 'عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة لاحقاً.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = async (question: string) => {
    setInputText(question);
    // Simulate sending the message
    setTimeout(() => {
      setInputText('');
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        type: 'user',
        content: question,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // Simulate AI response
      setTimeout(() => {
        const aiMessage: Message = {
          id: `msg-${Date.now()}-ai`,
          type: 'ai',
          content: 'هذا سؤال رائع! يمكنني مساعدتك في هذا الموضوع...',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsLoading(false);
      }, 1000);
    }, 100);
  };

  const renderMessageItem = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.type === 'user' ? styles.userMessageContainer : styles.aiMessageContainer,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor:
              item.type === 'user'
                ? colors.tint
                : colors.surface,
          },
        ]}
      >
        <ThemedText
          style={[
            styles.messageText,
            {
              color: item.type === 'user' ? '#fff' : colors.text,
            },
          ]}
        >
          {item.content}
        </ThemedText>

        {item.suggestions && item.suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {item.suggestions.map((suggestion, index) => (
              <Pressable
                key={index}
                onPress={() => handleQuickQuestion(suggestion)}
                style={[
                  styles.suggestionButton,
                  {
                    backgroundColor:
                      item.type === 'user'
                        ? 'rgba(255,255,255,0.2)'
                        : colors.tint,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.suggestionText,
                    {
                      color: item.type === 'user' ? '#fff' : colors.text,
                    },
                  ]}
                >
                  {suggestion}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        )}
      </View>
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
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Pressable onPress={() => router.back()}>
          <ThemedText style={styles.backButton}>←</ThemedText>
        </Pressable>
        <ThemedText type="defaultSemiBold">مساعد ذكي</ThemedText>
      </View>

      {/* Messages List */}
      {messages.length === 1 && !isLoading ? (
        <View style={styles.quickQuestionsContainer}>
          <ThemedText type="subtitle" style={styles.quickQuestionsTitle}>
            أسئلة شائعة
          </ThemedText>
          {QUICK_QUESTIONS.map((question, index) => (
            <Pressable
              key={index}
              onPress={() => handleQuickQuestion(question)}
              style={[styles.quickQuestionButton, { backgroundColor: colors.surface }]}
            >
              <ThemedText style={styles.quickQuestionText}>{question}</ThemedText>
            </Pressable>
          ))}
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.tint} size="small" />
          <ThemedText style={styles.loadingText}>جاري المعالجة...</ThemedText>
        </View>
      )}

      {/* Input Area */}
      <View style={[styles.inputArea, { backgroundColor: colors.surface }]}>
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="اسأل سؤالك هنا..."
          placeholderTextColor={colors.icon}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          editable={!isLoading}
          textAlign="right"
        />
        <Pressable
          onPress={handleSendMessage}
          disabled={!inputText.trim() || isLoading}
          style={[
            styles.sendButton,
            {
              backgroundColor: inputText.trim() ? colors.tint : colors.border,
            },
          ]}
        >
          <ThemedText style={styles.sendButtonText}>إرسال</ThemedText>
        </Pressable>
      </View>
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
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    fontSize: 24,
  },
  messagesList: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  messageContainer: {
    marginVertical: Spacing.sm,
    flexDirection: 'row',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.large,
    gap: Spacing.md,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  suggestionsContainer: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  suggestionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.medium,
  },
  suggestionText: {
    fontSize: 12,
  },
  quickQuestionsContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    justifyContent: 'center',
  },
  quickQuestionsTitle: {
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  quickQuestionButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.large,
    marginBottom: Spacing.md,
  },
  quickQuestionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 12,
    opacity: 0.6,
  },
  inputArea: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.medium,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
