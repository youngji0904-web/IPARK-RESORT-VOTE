import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Participant } from '../types';
import { 
  UserPlus, 
  Users, 
  Edit3, 
  Trash2, 
  Sparkles, 
  RotateCcw, 
  Check, 
  X, 
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface ParticipantManagerViewProps {
  isModal?: boolean;
  onClose?: () => void;
}

export const ParticipantManagerView: React.FC<ParticipantManagerViewProps> = ({ 
  isModal = false, 
  onClose 
}) => {
  const { 
    participants, 
    addParticipant, 
    updateParticipant, 
    deleteParticipant, 
    resetParticipantsToDefault,
    clearAllParticipants,
    setAdminSubTab
  } = useApp();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [department, setDepartment] = useState('');
  const [tag, setTag] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<{
    title: string;
    desc: string;
    btnLabel: string;
    btnColor: string;
    action: () => void;
  } | null>(null);

  const resetForm = () => {
    setName('');
    setTopic('');
    setDepartment('');
    setTag('');
    setEditingId(null);
    setShowForm(false);
    setFormError(null);
  };

  const handleStartEdit = (p: Participant) => {
    setEditingId(p.id);
    setName(p.name);
    setTopic(p.topic);
    setDepartment(p.department || '');
    setTag(p.tag || '');
    setShowForm(true);
    setFormError(null);
    soundManager.playClick();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !topic.trim()) {
      setFormError('참여자 이름과 프로젝트 주제를 모두 입력해주세요.');
      return;
    }

    if (editingId) {
      updateParticipant(editingId, {
        name: name.trim(),
        topic: topic.trim(),
        department: department.trim() || undefined,
        tag: tag.trim() || undefined,
      });
    } else {
      addParticipant({
        name: name.trim(),
        topic: topic.trim(),
        department: department.trim() || undefined,
        tag: tag.trim() || 'AI Vibe App',
        executiveScore: 85,
      });
    }

    resetForm();
    soundManager.playClick();
  };

  const handleDelete = (id: string, pName: string) => {
    setPendingConfirm({
      title: '참가자 삭제',
      desc: `'${pName}' 후보를 삭제하시겠습니까? 관련 투표 내역도 함께 정리됩니다.`,
      btnLabel: '삭제 실행',
      btnColor: 'bg-rose-600 hover:bg-rose-700',
      action: () => deleteParticipant(id),
    });
  };

  const handleResetToDefault = () => {
    setPendingConfirm({
      title: '기본 6팀 복원',
      desc: '기본 예시 참가자 6팀으로 복원하시겠습니까? (부서/이름/주제가 기본값으로 복원됩니다)',
      btnLabel: '기본 6팀 복원',
      btnColor: 'bg-indigo-600 hover:bg-indigo-700',
      action: () => resetParticipantsToDefault(),
    });
  };

  const handleClearAll = () => {
    setPendingConfirm({
      title: '참가자 전체 비우기',
      desc: '등록된 참가자 목록을 전체 비우시겠습니까? (새로운 참가팀을 처음부터 직접 등록하여 테스트할 수 있습니다)',
      btnLabel: '전체 비우기',
      btnColor: 'bg-rose-600 hover:bg-rose-700',
      action: () => clearAllParticipants(),
    });
  };

  return (
    <div className={`max-w-4xl mx-auto px-4 ${isModal ? 'py-4' : 'pb-32 pt-4'}`}>
      {!isModal && (
        <div className="mb-4">
          <button
            onClick={() => setAdminSubTab('total')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>토탈 대시보드로 돌아가기</span>
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Users className="w-3.5 h-3.5" />
              참여자 실시간 관리
            </span>
            <span className="text-xs text-slate-500 font-medium">
              현재 총 {participants.length}팀 등록됨
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            경진대회 참가자 & 프로젝트 주제 등록
          </h2>
        </div>

        {isModal && onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <button
          id="btn-open-add-form"
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>신규 참가자(팀) 실시간 등록</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToDefault}
            className="py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
            기본 6팀 복원
          </button>

          <button
            onClick={handleClearAll}
            className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            참가자 전체 비우기
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-5 sm:p-6 rounded-3xl bg-white border border-indigo-200 shadow-md animate-in zoom-in-95 duration-200"
        >
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              {editingId ? '참가자 정보 수정' : '신규 참가자(팀) 실시간 등록'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              취소
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                참여자 이름 또는 팀명 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 홍길동 (DX팀) 또는 VibeMasters 팀"
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                소속 부서
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="예: 디지털혁신실, 마케팅본부 등"
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                프로젝트 발표 주제 및 세부 설명 <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="AI 바이브코딩으로 구현한 솔루션의 핵심 기능과 사내 기대효과를 적어주세요."
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                기술 키워드 태그
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="예: Agent Workflow, Claude Code, No-Code AI 등"
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {formError && (
            <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {formError}
            </div>
          )}

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="py-2 px-4 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="py-2 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{editingId ? '수정 완료' : '등록 완료'}</span>
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="space-y-3">
        {participants.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs sm:text-sm">
            등록된 참가팀이 없습니다. 상단의 <strong>[신규 참가자 등록]</strong>으로 직접 등록하거나 <strong>[기본 6팀 복원]</strong>을 눌러주세요.
          </div>
        ) : (
          participants.map((p, idx) => (
            <div
              key={p.id}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="text-base font-black text-slate-900">{p.name}</h4>
                    {p.department && (
                      <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                        {p.department}
                      </span>
                    )}
                    {p.tag && (
                      <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-bold">
                        {p.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    {p.topic}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                <button
                  onClick={() => handleStartEdit(p)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-indigo-600 transition-colors cursor-pointer"
                  title="수정"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(p.id, p.name)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* In-App Confirmation Modal */}
      {pendingConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  {pendingConfirm.title}
                </h3>
                <span className="text-[11px] font-semibold text-slate-500">확인</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {pendingConfirm.desc}
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setPendingConfirm(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={() => {
                  pendingConfirm.action();
                  setPendingConfirm(null);
                }}
                className={`px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-xs cursor-pointer ${pendingConfirm.btnColor}`}
              >
                {pendingConfirm.btnLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
