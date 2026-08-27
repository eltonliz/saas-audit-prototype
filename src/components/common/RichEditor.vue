<template>
  <div class="rich-editor" :class="{ focused: isFocused }">
    <!-- 工具栏 -->
    <div class="re-toolbar">
      <button type="button" class="re-btn" title="HTML 源" @click="onToggleSource"><span class="re-btn-icon">&lt;/&gt;</span></button>
      <span class="re-sep"></span>
      <button type="button" class="re-btn" title="撤销" @click="exec('undo')"><span class="re-btn-icon">↶</span></button>
      <button type="button" class="re-btn" title="重做" @click="exec('redo')"><span class="re-btn-icon">↷</span></button>
      <span class="re-sep"></span>
      <select class="re-select" @change="onParagraph($event)">
        <option value="p">段落</option>
        <option value="h1">标题 1</option>
        <option value="h2">标题 2</option>
        <option value="h3">标题 3</option>
        <option value="blockquote">引用</option>
      </select>
      <select class="re-select" @change="onFontSize($event)">
        <option value="3">16px</option>
        <option value="1">12px</option>
        <option value="2">14px</option>
        <option value="4">18px</option>
        <option value="5">20px</option>
        <option value="6">24px</option>
      </select>
      <span class="re-sep"></span>
      <button type="button" class="re-btn re-bold" title="粗体" @click="exec('bold')"><span style="font-weight:700">B</span></button>
      <button type="button" class="re-btn" title="斜体" @click="exec('italic')"><span style="font-style:italic">I</span></button>
      <button type="button" class="re-btn" title="下划线" @click="exec('underline')"><span style="text-decoration:underline">U</span></button>
      <button type="button" class="re-btn" title="删除线" @click="exec('strikeThrough')"><span style="text-decoration:line-through">S</span></button>
      <span class="re-sep"></span>
      <label class="re-color-btn" title="字体颜色">
        <span style="color:#1890FF">A</span>
        <input type="color" value="#1890FF" @input="onColor($event)" />
      </label>
      <span class="re-sep"></span>
      <button type="button" class="re-btn" title="引用" @click="exec('formatBlock', 'blockquote')"><span class="re-btn-icon">&ldquo;&rdquo;</span></button>
      <button type="button" class="re-btn" title="有序列表" @click="exec('insertOrderedList')"><span class="re-btn-icon">1.</span></button>
      <button type="button" class="re-btn" title="无序列表" @click="exec('insertUnorderedList')"><span class="re-btn-icon">•</span></button>
      <span class="re-sep"></span>
      <button type="button" class="re-btn" title="左对齐" @click="exec('justifyLeft')"><span class="re-btn-icon">⇤</span></button>
      <button type="button" class="re-btn" title="居中" @click="exec('justifyCenter')"><span class="re-btn-icon">⇔</span></button>
      <button type="button" class="re-btn" title="右对齐" @click="exec('justifyRight')"><span class="re-btn-icon">⇥</span></button>
    </div>

    <!-- 编辑区 -->
    <div v-if="!sourceMode" ref="editorRef" class="re-body" :data-placeholder="placeholder" contenteditable="true" spellcheck="false" @input="onInput" @focus="isFocused = true" @blur="isFocused = false"></div>
    <textarea v-else ref="textareaRef" class="re-source" :value="sourceValue" @input="onSourceInput"></textarea>

    <!-- 字数统计 -->
    <div class="re-footer">当前已输入 {{ charCount }} 个字符，您还可以输入 {{ maxLength - charCount }} 个字符。</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
  maxLength?: number;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>();

const editorRef = ref<HTMLElement | null>(null);
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const isFocused = ref(false);
const sourceMode = ref(false);
const sourceValue = ref('');
const charCount = ref(0);
const maxLength = props.maxLength ?? 50000;

watch(() => props.modelValue, (v) => {
  if (editorRef.value && editorRef.value.innerHTML !== v) {
    editorRef.value.innerHTML = v || '';
  }
  sourceValue.value = v || '';
  charCount.value = stripHtml(v || '').length;
  if (charCount.value > maxLength) charCount.value = maxLength;
}, { immediate: true });

onMounted(() => {
  if (editorRef.value) editorRef.value.innerHTML = props.modelValue || '';
  sourceValue.value = props.modelValue || '';
  charCount.value = stripHtml(props.modelValue || '').length;
});

function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return (div.textContent || div.innerText || '').trim();
}

function exec(cmd: string, value?: string) {
  if (sourceMode.value) return;
  editorRef.value?.focus();
  document.execCommand(cmd, false, value);
  sync();
}

function onInput() { sync(); }
function sync() {
  if (!editorRef.value) return;
  const html = editorRef.value.innerHTML;
  charCount.value = stripHtml(html).length;
  emit('update:modelValue', html);
}

function onToggleSource() {
  if (!sourceMode.value) {
    sourceValue.value = editorRef.value?.innerHTML ?? '';
  } else {
    if (textareaRef.value) editorRef.value && (editorRef.value.innerHTML = textareaRef.value.value);
  }
  sourceMode.value = !sourceMode.value;
}
function onSourceInput() {
  if (!textareaRef.value) return;
  sourceValue.value = textareaRef.value.value;
  charCount.value = stripHtml(sourceValue.value).length;
  emit('update:modelValue', sourceValue.value);
}

function onParagraph(e: Event) { exec('formatBlock', (e.target as HTMLSelectElement).value); (e.target as HTMLSelectElement).value = 'p'; }
function onFontSize(e: Event) { exec('fontSize', (e.target as HTMLSelectElement).value); (e.target as HTMLSelectElement).value = '3'; }
function onColor(e: Event) { exec('foreColor', (e.target as HTMLInputElement).value); }
</script>

<style scoped>
.rich-editor { border: 1px solid #D0D5DD; border-radius: 6px; background: #fff; transition: border-color 0.2s; }
.rich-editor.focused { border-color: #12B76A; }
.re-toolbar { display: flex; align-items: center; gap: 4px; padding: 6px 8px; border-bottom: 1px solid #EAECF0; background: #F9FAFB; flex-wrap: wrap; }
.re-btn { display: inline-flex; align-items: center; justify-content: center; min-width: 28px; height: 28px; padding: 0 6px; border: 1px solid transparent; background: transparent; border-radius: 4px; cursor: pointer; color: #1F2C3E; font-size: 13px; }
.re-btn:hover { background: #EAECF0; }
.re-btn:active { background: #D0D5DD; }
.re-btn-icon { font-size: 12px; }
.re-sep { width: 1px; height: 16px; background: #EAECF0; margin: 0 4px; }
.re-select { height: 28px; padding: 0 8px; border: 1px solid #D0D5DD; border-radius: 4px; background: #fff; color: #1F2C3E; font-size: 12px; cursor: pointer; }
.re-color-btn { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; cursor: pointer; font-weight: 700; }
.re-color-btn input[type="color"] { position: absolute; inset: 0; opacity: 0; cursor: pointer; }

.re-body { min-height: 240px; padding: 12px 14px; font-size: 14px; color: #1F2C3E; line-height: 1.7; outline: none; }
.re-body:empty::before { content: attr(data-placeholder); color: #C0C4CC; pointer-events: none; }
.re-body :deep(h1), .re-body :deep(h2), .re-body :deep(h3) { margin: 12px 0 6px; font-weight: 700; }
.re-body :deep(h1) { font-size: 22px; }
.re-body :deep(h2) { font-size: 18px; }
.re-body :deep(h3) { font-size: 16px; }
.re-body :deep(blockquote) { margin: 8px 0; padding: 4px 12px; border-left: 3px solid #D0D5DD; color: #667085; }
.re-body :deep(ul), .re-body :deep(ol) { margin: 6px 0; padding-left: 24px; }
.re-body :deep(a) { color: #1890FF; text-decoration: underline; }

.re-source { width: 100%; min-height: 240px; padding: 12px 14px; border: none; outline: none; font-family: monospace; font-size: 13px; line-height: 1.6; resize: vertical; box-sizing: border-box; }

.re-footer { padding: 8px 12px; text-align: right; font-size: 12px; color: #98A2B3; border-top: 1px solid #EAECF0; }
</style>