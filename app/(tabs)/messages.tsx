import { useState, useEffect } from 'react';
import { StyleSheet, FlatList, Pressable, View, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Conversation, Message } from '@/lib/types';

// Mock conversations data
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv1',
    participantIds: ['user1', 'worker1'],
    lastMessage: {
      id: 'msg1',
      conversationId: 'conv1',
      senderId: 'worker1',
      receiverId: 'user1',
      content: 'تمام، سأكون عندك غداً الساعة 10 صباحاً',
      createdAt: new Date(Date.now() - 3600000),
      isRead: true,
    },
    lastMessageAt: new Date(Date.now() - 3600000),
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'conv2',
    participantIds: ['user1', 'worker2'],
    lastMessage: {
      id: 'msg2',
      conversationId: 'conv2',
      senderId: 'user1',
      receiverId: 'worker2',
      content: 'هل لديك أوقات فارغة هذا الأسبوع؟',
      createdAt: new Date(Date.now() - 7200000),
      isRead: false,
    },
    lastMessageAt: new Date(Date.now() - 7200000),
    createdAt: new Date(Date.now() - 172800000),
  },
];

interface ConversationWithWorker extends Conversation {
  workerName: string;
  workerImage?: string;
}

export default function MessagesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const [conversations, setConversations] = useState<ConversationWithWorker[]>(
    MOCK_CONVERSATIONS.map((conv) => ({
      ...conv,
      workerName: conv.participantIds[1] === 'worker1' ? 'أحمد محمد' : 'فاطمة علي',
      workerImage: 'https://via.placeholder.com/50',
    }))
  );
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) =>
    conv.workerName.includes(searchQuery)
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `${minutes} دقيقة`;
    if (hours < 24) return `${hours} ساعة`;
    if (days < 7) return `${days} أيام`;
    return date.toLocaleDateString('ar-SA');
  };

  const renderConversationItem = ({ item }: { item: ConversationWithWorker }) => {
    const isUnread = item.lastMessage && !item.lastMessage.isRead;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.conversationItem,
          {
            backgroundColor: isUnread ? colors.surface : colors.background,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <View style={styles.conversationContent}>
          <View style={styles.header}>
            <ThemedText
              type={isUnread ? 'defaultSemiBold' : 'default'}
              style={styles.workerName}
            >
              {item.workerName}
            </ThemedText>
            <ThemedText style={styles.time}>
              {item.lastMessage && formatTime(item.lastMessage.createdAt)}
            </ThemedText>
          </View>

          <View style={styles.messagePreview}>
            <ThemedText
              numberOfLines={1}
              style={[
                styles.messageText,
                isUnread && { fontWeight: '600' },
              ]}
            >
              {item.lastMessage?.content || 'لا توجد رسائل'}
            </ThemedText>
            {isUnread && <View style={styles.unreadBadge} />}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, Spacing.lg),
          paddingBottom: Math.max(insets.bottom, Spacing.lg),
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.pageTitle}>
          الرسائل
        </ThemedText>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="ابحث عن محادثة..."
          placeholderTextColor={colors.icon}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversationItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText type="subtitle">لا توجد محادثات</ThemedText>
            <ThemedText style={styles.emptyText}>
              ابدأ محادثة جديدة مع عامل
            </ThemedText>
          </View>
        }
        ItemSeparatorComponent={() => (
          <View
            style={[
              styles.separator,
              { backgroundColor: colors.border },
            ]}
          />
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  pageTitle: {
    textAlign: 'right',
  },
  searchBar: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    borderRadius: BorderRadius.medium,
    paddingHorizontal: Spacing.md,
  },
  searchInput: {
    paddingVertical: Spacing.md,
    fontSize: 16,
    textAlign: 'right',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  conversationItem: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  conversationContent: {
    gap: Spacing.md,
  },
  workerName: {
    fontSize: 16,
  },
  time: {
    fontSize: 12,
    opacity: 0.6,
  },
  messagePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    opacity: 0.7,
  },
  unreadBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  separator: {
    height: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.6,
  },
});
