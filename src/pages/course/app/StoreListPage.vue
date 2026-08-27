<template>
  <div class="store-list-page">
    <!-- 头部品牌 + 搜索 -->
    <header class="brand-area">
      <div class="brand-bar">
        <span class="back-btn" @click="$router.back()">←</span>
        <div class="brand-logo"><EmojiIcon emoji="🏪" :size="18" /> 门店</div>
      </div>
      <div class="search-box">
        <span class="search-icon"><t-icon name="search" :size="16" /></span>
        <input v-model="search" placeholder="搜索门店" class="search-input" />
      </div>
    </header>

    <!-- 门店列表瀑布流 -->
    <div class="store-list">
      <div v-for="s in filteredStores" :key="s.id" class="store-card" @click="enterStore(s.id)">
        <div class="store-cover">
          <span class="store-logo"><EmojiIcon :emoji="s.logo_emoji" :size="56" /></span>
        </div>
        <div class="store-body">
          <div class="store-name-row">
            <span class="store-name">{{ s.name }}</span>
            <span v-for="t in s.tags" :key="t" class="store-tag">{{ t }}</span>
          </div>
          <div class="store-meta">{{ s.course_count }} 门课程 · {{ formatFans(s.fans) }} 粉丝</div>
          <button class="enter-btn">进店</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import EmojiIcon from './EmojiIcon.vue';
import { useStoreStore } from '../../../stores/store-store';

const router = useRouter();
const storeStore = useStoreStore();
const search = ref('');

const filteredStores = computed(() => {
  const kw = search.value.trim();
  if (!kw) return storeStore.stores;
  return storeStore.stores.filter(s => s.name.includes(kw));
});

function enterStore(id: string) { router.push('/app/student/store/' + id); }
function formatFans(n: number) { return n >= 10000 ? (n / 10000).toFixed(1) + '万' : String(n); }
</script>

<style scoped>
.store-list-page { padding-bottom: 80px; background: #F5F5F5; min-height: 100vh; }
.brand-area { background: linear-gradient(135deg, #12B76A, #0E9B58); padding: 12px 16px 20px; border-radius: 0 0 16px 16px; }
.brand-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.back-btn { font-size: 18px; color: #fff; cursor: pointer; }
.brand-logo { font-size: 16px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 4px; }
.search-box { display: flex; align-items: center; background: #fff; border-radius: 20px; padding: 8px 12px; gap: 8px; }
.search-icon { display: flex; align-items: center; opacity: 0.5; }
.search-input { flex: 1; border: none; outline: none; font-size: 14px; background: transparent; }

.store-list { padding: 12px 16px; display: flex; flex-direction: column; gap: 12px; }
.store-card { background: #fff; border-radius: 12px; overflow: hidden; cursor: pointer; }
.store-cover { height: 120px; background: linear-gradient(135deg, #E6F9F1, #D1FADF); display: flex; align-items: center; justify-content: center; }
.store-logo { display: flex; align-items: center; justify-content: center; }
.store-body { padding: 12px 14px; }
.store-name-row { display: flex; align-items: center; gap: 6px; }
.store-name { font-size: 15px; font-weight: 600; color: #1F2C3E; }
.store-tag { font-size: 10px; color: #12B76A; background: #E6F9F1; padding: 1px 6px; border-radius: 6px; }
.store-meta { font-size: 12px; color: #98A2B3; margin-top: 4px; }
.enter-btn { margin-top: 10px; width: 100%; padding: 10px; background: #12B76A; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; }
</style>
