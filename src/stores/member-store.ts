/**
 * 课程与营期域 — 积分子域 Pinia Store
 * 对齐 SugarMate useMemberStore（action名1:1）
 * Action 2个：积分入账+查询流水
 * D22 仅获取不消费（积分商城本期不做）
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { PointRecord, AddPointRecordInput } from '../contracts/schemas/member-schemas';
import { SEED_POINT_RECORDS } from '../adapters/sim/member-sim-data';

const now = () => Math.floor(Date.now() / 1000);
const genId = (prefix: string) => `${prefix}-${new Date().toISOString().slice(0, 7).replace('-', '')}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;

export const useMemberStore = defineStore('member', () => {
  const pointRecords = ref<PointRecord[]>([...SEED_POINT_RECORDS]);

  /** 积分入账（D24·source_type: checkin/completion/quiz/task） */
  function addPointRecord(input: AddPointRecordInput): PointRecord {
    const record: PointRecord = { ...input, id: genId('PTS'), created_at: now() };
    pointRecords.value.push(record);
    return record;
  }

  function loadPointRecords(studentId?: string): PointRecord[] {
    return studentId ? pointRecords.value.filter(r => r.student_id === studentId) : pointRecords.value;
  }

  return { pointRecords, addPointRecord, loadPointRecords };
});
