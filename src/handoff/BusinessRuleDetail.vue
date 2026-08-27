<template>
  <div class="rule-detail-formatted">
    <template v-for="(group, gi) in groups" :key="gi">
      <p v-if="group.type === 'intro'" class="rd-intro">{{ group.content }}</p>
      <ol v-else class="rd-list">
        <li v-for="(item, ii) in group.items" :key="ii">
          <span class="rd-marker">{{ item.marker }}</span>
          <span class="rd-text">{{ item.content }}</span>
        </li>
      </ol>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ detail: string }>();

const CIRCLED_RE = /[①②③④⑤⑥⑦⑧⑨⑩]/;

interface ItemSegment {
  type: 'item';
  marker: string;
  content: string;
}
interface IntroSegment {
  type: 'intro';
  content: string;
}
type Segment = IntroSegment | ItemSegment;

const groups = computed(() => {
  const parts = props.detail.split(/([①②③④⑤⑥⑦⑧⑨⑩])/);
  const segments: Segment[] = [];
  let introBuffer = '';

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.length === 1 && CIRCLED_RE.test(part)) {
      if (introBuffer.trim()) {
        segments.push({ type: 'intro', content: introBuffer.trim() });
        introBuffer = '';
      }
      const content = parts[i + 1] ?? '';
      i++;
      segments.push({ type: 'item', marker: part, content: content.trim() });
    } else {
      introBuffer += part;
    }
  }
  if (introBuffer.trim()) {
    segments.push({ type: 'intro', content: introBuffer.trim() });
  }

  // 连续 item 合并为一个列表组
  const result: (IntroSegment | { type: 'items'; items: ItemSegment[] })[] = [];
  let currentItems: ItemSegment[] = [];
  for (const seg of segments) {
    if (seg.type === 'item') {
      currentItems.push(seg);
    } else {
      if (currentItems.length) {
        result.push({ type: 'items', items: currentItems });
        currentItems = [];
      }
      result.push(seg);
    }
  }
  if (currentItems.length) {
    result.push({ type: 'items', items: currentItems });
  }
  return result;
});
</script>

<style scoped>
.rule-detail-formatted {
  font-size: inherit;
  line-height: 1.7;
}
.rd-intro {
  margin: 0 0 6px;
}
.rd-intro:last-child {
  margin-bottom: 0;
}
.rd-list {
  list-style: none;
  padding-left: 0;
  margin: 0 0 6px;
}
.rd-list:last-child {
  margin-bottom: 0;
}
.rd-list li {
  display: flex;
  gap: 4px;
  margin-bottom: 6px;
}
.rd-list li:last-child {
  margin-bottom: 0;
}
.rd-marker {
  flex-shrink: 0;
  font-weight: 600;
}
</style>
