import { useState, useEffect, useRef } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Message } from '@/lib/types';

// Mock messages data
const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    conversationId: 'conv1',
    senderId: 'worker1',
    receiverId: 'user1',
    content: 'السلام عليكم، كيف حالك؟',
    createdAt: new Date(Date.now() - 3600000),
    isRead: true,
  },
  {
    id: '2',
    conversationId: 'conv1',
    senderId: 'user1',
    receiverId: 'worker1',
    content: 'وعليكم السلام، الحمد لله بخير. هل يمكنك مساعدتي بالمشروع؟',
    createdAt: new Date(Date.now() - 3300000),
    isRead: true,
  },
  {
    id: '3',
    conversationId: 'conv1',
    senderId: 'worker1',
    receiverId: 'user1',
    content: 'نعم بالتأكيد! متى تريد أن نبدأ؟',
    createdAt: new Date(Date.now() - 3000000),
    isRead: true,
  },
];

export default function ChatScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const workerName = params.workerName as string || 'أحمد محمد';
  const workerId = params.workerId as string || 'worker1';
  const userId = 'user1'; // Mock current user

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Simulate receiving messages
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        const newMsg: Message = {
          id: `msg-${Date.now()}`,
          conversationId: 'conv1',
          senderId: workerId,
          receiverId: userId,
          content: 'تمام، سأكون عندك غداً الساعة 10 صباحاً',
          createdAt: new Date(),
          isRead: true,
        };
        setMessages((prev) => [...prev, newMsg]);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isTyping, workerId, userId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId: 'conv1',
      senderId: userId,
      receiverId: workerId,
      content: newMessage,
      createdAt: new Date(),
      isRead: true,
    };

    setMessages((prev) => [...prev, userMsg]);
    setNewMessage('');
    setIsLoading(true);

    // Simulate worker typing
    setTimeout(() => {
      setIsTyping(true);
      setIsLoading(false);
    }, 500);
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isUserMessage = item.senderId === userId;

    return (
      <View
        style={[
          styles.messageContainer,
          isUserMessage ? styles.userMessageContainer : styles.workerMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isUserMessage ? colors.tint : colors.surface,
            },
          ]}
        >
          <ThemedText
            style={[
              styles.messageText,
              {
                color: isUserMessage ? '#fff' : colors.text,
              },
            ]}
          >
            {item.content}
          </ThemedText>
          <ThemedText
            style={[
              styles.messageTime,
              {
                color: isUserMessage ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
              },
            ]}
          >
            {item.createdAt.toLocaleTimeString('ar-SA', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </ThemedText>
        </View>
      </View>
    );
  };

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
        <View style={styles.headerInfo}>
          <ThemedText type="defaultSemiBold">{workerName}</ThemedText>
          <ThemedText style={styles.status}>
            {isTyping ? t('chat.typing') : t('chat.online')}
          </ThemedText>
        </View>
      </View>

      {/* Messages List */}
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

      {/* Typing Indicator */}
      {isTyping && (
        <View style={[styles.typingContainer, { backgroundColor: colors.surface }]}>
          <ThemedText style={styles.typingText}>{workerName} {t('chat.typing')}</ThemedText>
          <View style={styles.typingDots}>
            <View style={[styles.dot, { backgroundColor: colors.tint }]} />
            <View style={[styles.dot, { backgroundColor: colors.tint }]} />
            <View style={[styles.dot, { backgroundColor: colors.tint }]} />
          </View>
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
          placeholder={t('chat.messagePlaceholder')}
          placeholderTextColor={colors.icon}
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
          editable={!isLoading}
          textAlign="right"
        />
        <Pressable
          onPress={handleSendMessage}
          disabled={!newMessage.trim() || isLoading}
          style={[
            styles.sendButton,
            {
              backgroundColor: newMessage.trim() ? colors.tint : colors.border,
            },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <ThemedText style={styles.sendButtonText}>
              {t('chat.send')}
            </ThemedText>
          )}
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
  headerInfo: {
    flex: 1,
  },
  status: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
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
  workerMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.large,
    gap: Spacing.xs,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  typingText: {
    fontSize: 12,
    opacity: 0.6,
  },
  typingDots: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
