/**
 * 课程与营期域 — 讲师子域 Sim 种子数据
 * ID 打通：LECT-202608-00001~00003
 */
import type { Lecturer, LecturerAssistantRelation } from '../../contracts/schemas/lecturer-schemas';

const now = Math.floor(Date.now() / 1000);
const dayAgo = (n: number) => now - n * 86400;

// ── 讲师（ENT-LECT-001·D1通用化·can_be_main/can_be_assistant配置字段）──
export const SEED_LECTURERS: Lecturer[] = [
  {
    id: 'LECT-202608-00001', lecturer_no: 'LECT-202608-00001',
    name: '张三', avatar: '', phone: '13800001111', email: 'zhangsan@example.com',
    role_type: '资深讲师', can_be_main: true, can_be_assistant: false,
    source: 'form_add', merchant_member_id: null, merchant_name: null,
    cert_no: 'CERT-001', cert_image: '', institution: '在线教育平台', department: '通识教育教研组', title: '资深讲师', bio: '学习方法专家，专注高效学习与研究20年',
    review_status: 'approved', reviewer_id: 'admin-001', review_remark: undefined, reviewed_at: dayAgo(30),
    status: 'active', left_at: null, left_reason: undefined,
    total_courses: 3, total_camps: 2, total_students: 4590, total_commission: 350000,
    created_at: dayAgo(30), updated_at: dayAgo(20),
  },
  {
    id: 'LECT-202608-00002', lecturer_no: 'LECT-202608-00002',
    name: '李四', avatar: '', phone: '13800002222', email: 'lisi@example.com',
    role_type: '资深讲师', can_be_main: true, can_be_assistant: false,
    source: 'merchant_import', merchant_member_id: 'MM-001', merchant_name: '合作教育机构',
    cert_no: 'CERT-002', cert_image: '', institution: '职业发展协会', department: '职业技能教研组', title: '讲师', bio: '职场沟通专家，10年企业培训经验',
    review_status: 'approved', reviewer_id: 'admin-001', review_remark: undefined, reviewed_at: dayAgo(25),
    status: 'active', left_at: null, left_reason: undefined,
    total_courses: 2, total_camps: 1, total_students: 1801, total_commission: 120000,
    created_at: dayAgo(25), updated_at: dayAgo(15),
  },
  {
    id: 'LECT-202608-00003', lecturer_no: 'LECT-202608-00003',
    name: '王助教', avatar: '', phone: '13800006666', email: undefined,
    role_type: '助教', can_be_main: false, can_be_assistant: true,
    source: 'form_add', merchant_member_id: null, merchant_name: null,
    cert_no: undefined, cert_image: undefined, institution: undefined, department: undefined, title: undefined, bio: '助教，负责学员拉新与答疑',
    review_status: 'approved', reviewer_id: 'admin-001', review_remark: undefined, reviewed_at: dayAgo(20),
    status: 'active', left_at: null, left_reason: undefined,
    total_courses: 0, total_camps: 1, total_students: 68, total_commission: 8000,
    created_at: dayAgo(20), updated_at: dayAgo(18),
  },
  {
    id: 'LECT-202608-00007', lecturer_no: 'LECT-202608-00007',
    name: '王讲师', avatar: '', phone: '13800003333', email: 'wangshi@example.com',
    role_type: '资深讲师', can_be_main: true, can_be_assistant: false,
    source: 'form_add', merchant_member_id: null, merchant_name: null,
    cert_no: 'CERT-003', cert_image: '', institution: '技术学院', department: 'IT教研组', title: '高级讲师', bio: 'Python/数据分析专家，前大厂工程师',
    review_status: 'approved', reviewer_id: 'admin-001', review_remark: undefined, reviewed_at: dayAgo(28),
    status: 'active', left_at: null, left_reason: undefined,
    total_courses: 3, total_camps: 1, total_students: 9348, total_commission: 480000,
    created_at: dayAgo(50), updated_at: dayAgo(40),
  },
  {
    id: 'LECT-202608-00004', lecturer_no: 'LECT-202608-00004',
    name: '赵讲师', avatar: '', phone: '13800004444', email: 'zhaoshi@example.com',
    role_type: '资深讲师', can_be_main: true, can_be_assistant: false,
    source: 'form_add', merchant_member_id: null, merchant_name: null,
    cert_no: 'CERT-004', cert_image: '', institution: '新媒体学院', department: '运营教研组', title: '高级讲师', bio: '短视频运营专家，百万粉丝操盘手',
    review_status: 'approved', reviewer_id: 'admin-001', review_remark: undefined, reviewed_at: dayAgo(20),
    status: 'active', left_at: null, left_reason: undefined,
    total_courses: 3, total_camps: 2, total_students: 8092, total_commission: 390000,
    created_at: dayAgo(30), updated_at: dayAgo(15),
  },
  {
    id: 'LECT-202608-00005', lecturer_no: 'LECT-202608-00005',
    name: '刘讲师', avatar: '', phone: '13800005555', email: 'liushi@example.com',
    role_type: '资深讲师', can_be_main: true, can_be_assistant: false,
    source: 'merchant_import', merchant_member_id: 'MM-002', merchant_name: '商业咨询公司',
    cert_no: 'CERT-005', cert_image: '', institution: '商学院', department: '商业管理教研组', title: '讲师', bio: '商业思维与理财专家',
    review_status: 'approved', reviewer_id: 'admin-001', review_remark: undefined, reviewed_at: dayAgo(18),
    status: 'active', left_at: null, left_reason: undefined,
    total_courses: 3, total_camps: 0, total_students: 3013, total_commission: 240000,
    created_at: dayAgo(22), updated_at: dayAgo(9),
  },
];

// ── 讲师-助教关系（ENT-LECT-002·1讲师→N助教）──
export const SEED_ASSISTANT_RELATIONS: LecturerAssistantRelation[] = [
  { id: 'ASSTREL-202608-00001', lecturer_id: 'LECT-202608-00001', lecturer_name: '张三', assistant_id: 'LECT-202608-00003', assistant_name: '王助教', assistant_role_type: '助教', status: 'active', established_at: dayAgo(20), terminated_at: null, terminate_reason: undefined, created_at: dayAgo(20), updated_at: dayAgo(20) },
  { id: 'ASSTREL-202608-00002', lecturer_id: 'LECT-202608-00007', lecturer_name: '王讲师', assistant_id: 'LECT-202608-00003', assistant_name: '王助教', assistant_role_type: '助教', status: 'active', established_at: dayAgo(15), terminated_at: null, terminate_reason: undefined, created_at: dayAgo(15), updated_at: dayAgo(15) },
];
