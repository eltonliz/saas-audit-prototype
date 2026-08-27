/**
 * 课程与营期域 — 讲师子域 Pinia Store
 * 对齐 SugarMate useLecturerStore（action名1:1）
 * Action 10个：讲师CRUD+资质审核+状态流转+助教关系
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Lecturer, LecturerAssistantRelation, CreateLecturerInput, CreateAssistantRelationInput } from '../contracts/schemas/lecturer-schemas';
import { SEED_LECTURERS, SEED_ASSISTANT_RELATIONS } from '../adapters/sim/lecturer-sim-data';
import { validateLecturerTransition, validateLecturerReviewTransition } from '../contracts/state-machine/course-state-machine';

const now = () => Math.floor(Date.now() / 1000);
const genId = (prefix: string) => `${prefix}-${new Date().toISOString().slice(0, 7).replace('-', '')}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;

export const useLecturerStore = defineStore('lecturer', () => {
  const lecturers = ref<Lecturer[]>([...SEED_LECTURERS]);
  const assistantRelations = ref<LecturerAssistantRelation[]>([...SEED_ASSISTANT_RELATIONS]);

  function createLecturer(input: CreateLecturerInput): Lecturer {
    const lecturer: Lecturer = {
      ...input,
      id: genId('LECT'), lecturer_no: genId('LECT'),
      review_status: 'pending', status: 'active',
      total_courses: 0, total_camps: 0, total_students: 0, total_commission: 0,
      created_at: now(), updated_at: now(),
    } as Lecturer;
    lecturers.value.push(lecturer);
    return lecturer;
  }

  function importLecturerFromMerchant(input: { merchant_member_id: string; merchant_name: string; role_type: string; name: string; phone: string; avatar?: string; cert_no?: string; institution?: string; department?: string; title?: string; can_be_main: boolean }): Lecturer {
    return createLecturer({
      name: input.name, avatar: input.avatar, phone: input.phone, role_type: input.role_type,
      can_be_main: input.can_be_main, can_be_assistant: true,
      cert_no: input.cert_no, institution: input.institution, department: input.department, title: input.title,
      source: 'form_add',
    } as CreateLecturerInput);
  }

  function updateLecturer(id: string, patch: Partial<Lecturer>): void {
    const idx = lecturers.value.findIndex(l => l.id === id);
    if (idx >= 0) lecturers.value[idx] = { ...lecturers.value[idx], ...patch, updated_at: now() };
  }

  function loadLecturerList(): Lecturer[] { return lecturers.value; }
  function loadLecturer(id: string): Lecturer | undefined { return lecturers.value.find(l => l.id === id); }

  function approveLecturer(id: string, reviewerId: string): boolean {
    const l = lecturers.value.find(x => x.id === id);
    if (!l || !validateLecturerReviewTransition(l.review_status, 'approved')) return false;
    l.review_status = 'approved'; l.reviewer_id = reviewerId; l.reviewed_at = now(); l.updated_at = now();
    return true;
  }

  function rejectLecturer(id: string, reviewerId: string, remark: string): boolean {
    const l = lecturers.value.find(x => x.id === id);
    if (!l || !validateLecturerReviewTransition(l.review_status, 'rejected')) return false;
    l.review_status = 'rejected'; l.reviewer_id = reviewerId; l.review_remark = remark; l.reviewed_at = now(); l.updated_at = now();
    return true;
  }

  /** 讲师状态流转（D16·active→suspended→left·left终态快照锁定） */
  function transitionLecturerStatus(id: string, target: Lecturer['status']): boolean {
    const l = lecturers.value.find(x => x.id === id);
    if (!l || !validateLecturerTransition(l.status, target)) return false;
    l.status = target;
    if (target === 'left') { l.left_at = now(); }
    l.updated_at = now();
    return true;
  }

  function createAssistantRelation(input: CreateAssistantRelationInput): LecturerAssistantRelation {
    const rel: LecturerAssistantRelation = {
      ...input, id: genId('ASSTREL'), status: 'active',
      established_at: now(), created_at: now(), updated_at: now(),
    } as LecturerAssistantRelation;
    assistantRelations.value.push(rel);
    return rel;
  }

  function terminateAssistantRelation(id: string, reason: string): void {
    const rel = assistantRelations.value.find(r => r.id === id);
    if (rel) { rel.status = 'inactive'; rel.terminated_at = now(); rel.terminate_reason = reason; rel.updated_at = now(); }
  }

  return {
    lecturers, assistantRelations,
    createLecturer, importLecturerFromMerchant, updateLecturer, loadLecturerList, loadLecturer,
    approveLecturer, rejectLecturer, transitionLecturerStatus,
    createAssistantRelation, terminateAssistantRelation,
  };
});
