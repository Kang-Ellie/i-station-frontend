import { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  CheckCircle2,
  Circle,
  PlayCircle,
  CheckCircle,
  Plus,
  History,
  Link as LinkIcon,
  FileText,
  User,
  Clock,
  Send,
  ArrowRight,
  Eye,
  Github,
  Mail,
  Briefcase,
  FileCode,
  X,
  ChevronRight,
  LayoutDashboard,
  Users,
  LogIn,
  LogOut,
  PlusCircle,
  AtSign,
  Search,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UserStatus {
  label: string;
  color: string;
}

interface Member {
  name: string;
  position: string;
  avatar: string;
  email: string;
  github: string;
}

interface Comment {
  id: number;
  user: string;
  text: string;
  time: string;
}

interface Ticket {
  id: number;
  title: string;
  content: string;
  requester: string;
  worker: string;
  status: string;
  createdAt: string;
  comments: Comment[];
}

interface Log {
  id: number;
  ticketId: number;
  user: string;
  action: string;
  time: string;
  isImportant: boolean;
}

interface Note {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
}

interface TeamLink {
  id: number;
  title: string;
  url: string;
  type: string;
}

interface Team {
  id: string;
  name: string;
  password: string;
  members: Member[];
  tickets: Ticket[];
  logs: Log[];
  notes: Note[];
  links: TeamLink[];
  userStatuses: Record<string, UserStatus>;
}

interface CurrentUser {
  name: string;
  email: string;
  position: string;
  github: string;
  avatar: string;
}

interface StatusType {
  id: string;
  label: string;
  icon: typeof Circle;
  color: string;
  border: string;
  bg: string;
  next: string | null;
  nextLabel: string | null;
  back?: string;
  backLabel?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AVATARS = ['👩‍💻', '👨‍💻', '🎨', '⚙️', '🚀', '🧙‍♂️', '🕵️‍♀️', '🧑‍🚀'];

const STATUS_TYPES: StatusType[] = [
  {
    id: 'todo',
    label: 'Todo',
    icon: Circle,
    color: 'text-slate-400',
    border: 'border-slate-200',
    bg: 'bg-slate-50',
    next: 'doing',
    nextLabel: '수락하기',
  },
  {
    id: 'doing',
    label: 'Doing',
    icon: PlayCircle,
    color: 'text-blue-500',
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    next: 'done',
    nextLabel: '개발 완료',
  },
  {
    id: 'done',
    label: 'Done',
    icon: CheckCircle,
    color: 'text-green-500',
    border: 'border-green-200',
    bg: 'bg-green-50',
    next: 'checked',
    nextLabel: '최종 확인',
    back: 'doing',
    backLabel: '반려하기',
  },
  {
    id: 'checked',
    label: 'Checked',
    icon: CheckCircle2,
    color: 'text-purple-600',
    border: 'border-purple-200',
    bg: 'bg-purple-50',
    next: null,
    nextLabel: null,
  },
];

const USER_ACTIVITIES: UserStatus[] = [
  { label: '개발 중', color: 'bg-green-500' },
  { label: '회의 중', color: 'bg-blue-500' },
  { label: '휴식 중', color: 'bg-orange-400' },
  { label: '자리 비움', color: 'bg-slate-300' },
];

const INITIAL_TEAM: Team = {
  id: 'team_1',
  name: 'i들의 반란',
  password: '1234',
  members: [
    {
      name: '영아',
      position: 'Backend Lead',
      avatar: '👩‍💻',
      email: 'younga@istation.dev',
      github: 'https://github.com/younga',
    },
    {
      name: '민수',
      position: 'Frontend Dev',
      avatar: '👨‍💻',
      email: 'minsu@istation.dev',
      github: '',
    },
    {
      name: '지수',
      position: 'UI/UX Designer',
      avatar: '🎨',
      email: 'jisu@istation.dev',
      github: '',
    },
  ],
  tickets: [
    {
      id: 1,
      title: 'API 명세서 수정 요청',
      content:
        '로그인 시 반환되는 JWT 토큰에 유저 권한 정보 추가가 필요합니다.',
      requester: '영아',
      worker: '민수',
      status: 'doing',
      createdAt: '2026.03.11 10:00',
      comments: [],
    },
    {
      id: 2,
      title: '메인 페이지 레이아웃 수정',
      content: '사이드바 너비를 240px에서 200px로 조정해 주세요.',
      requester: '민수',
      worker: '지수',
      status: 'todo',
      createdAt: '2026.03.11 11:30',
      comments: [],
    },
  ],
  logs: [
    {
      id: 1,
      ticketId: 0,
      user: '영아',
      action: '팀 아지트 활성화',
      time: '03.11 09:00',
      isImportant: false,
    },
  ],
  notes: [
    {
      id: 1,
      title: '주간 회의록 (03.11)',
      content:
        '### 결정 사항\n- MVP 기능 확정\n- 이번주 UI 완성',
      author: '영아',
      date: '2026.03.11',
    },
  ],
  links: [
    { id: 1, title: '기획서 (Notion)', url: 'https://notion.so', type: 'planning' },
  ],
  userStatuses: {
    영아: { label: '개발 중', color: 'bg-green-500' },
    민수: { label: '회의 중', color: 'bg-blue-500' },
    지수: { label: '자리 비움', color: 'bg-slate-300' },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatLogTime(): string {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${m}.${d} ${h}:${min}`;
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export default function App() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [isTeamAuthorized, setIsTeamAuthorized] = useState(false);
  const [view, setView] = useState<'dashboard' | 'members' | 'archive'>('dashboard');

  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [isTeamAuthModalOpen, setIsTeamAuthModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isStatusPickerOpen, setIsStatusPickerOpen] = useState(false);
  const [teamSearchQuery, setTeamSearchQuery] = useState('');

  const [teams, setTeams] = useState<Team[]>([INITIAL_TEAM]);

  const activeTeam = useMemo(
    () => teams.find((t) => t.id === activeTeamId) ?? null,
    [teams, activeTeamId]
  );

  const selectedTicket = useMemo(
    () => activeTeam?.tickets.find((t) => t.id === selectedTicketId) ?? null,
    [activeTeam, selectedTicketId]
  );

  const onlineUsers = useMemo(() => {
    if (!activeTeam) return [];
    return activeTeam.members.filter((m) => {
      const status = activeTeam.userStatuses[m.name];
      return status && status.label !== '자리 비움';
    });
  }, [activeTeam]);

  const handlePersonalLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setCurrentUser({
      name: formData.get('username') as string,
      email: formData.get('email') as string,
      position: formData.get('position') as string,
      github: (formData.get('github') as string) || '',
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
    });
  };

  const handleCreateTeam = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    const newTeam: Team = {
      id: `team_${Date.now()}`,
      name: formData.get('teamName') as string,
      password: formData.get('teamPassword') as string,
      members: [{ ...currentUser }],
      tickets: [],
      logs: [
        {
          id: Date.now(),
          ticketId: 0,
          user: currentUser.name,
          action: '새 프로젝트 개설',
          time: '현재',
          isImportant: true,
        },
      ],
      notes: [],
      links: [],
      userStatuses: { [currentUser.name]: { label: '활동 중', color: 'bg-green-500' } },
    };
    setTeams((prev) => [...prev, newTeam]);
    setIsCreateTeamModalOpen(false);
    setActiveTeamId(newTeam.id);
    setIsTeamAuthorized(true);
  };

  const handleTeamAuth = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const team = teams.find((t) => t.id === activeTeamId);
    const password = (e.target as HTMLFormElement).password.value;
    if (!team || password !== team.password) {
      alert('팀 비밀번호가 틀렸습니다.');
      return;
    }
    const isAlreadyMember = team.members.some((m) => m.name === currentUser!.name);
    if (!isAlreadyMember) {
      setTeams((prev) =>
        prev.map((t) =>
          t.id === activeTeamId
            ? {
                ...t,
                members: [...t.members, { ...currentUser! }],
                userStatuses: {
                  ...t.userStatuses,
                  [currentUser!.name]: { label: '방금 입장', color: 'bg-green-500' },
                },
              }
            : t
        )
      );
    }
    setIsTeamAuthorized(true);
    setIsTeamAuthModalOpen(false);
    addLog(0, currentUser!.name, '공간 입장');
  };

  const addLog = (
    ticketId: number,
    user: string,
    action: string,
    isImportant = false
  ) => {
    const time = formatLogTime();
    setTeams((prev) =>
      prev.map((t) =>
        t.id === activeTeamId
          ? {
              ...t,
              logs: [
                { id: Date.now(), ticketId, user, action, time, isImportant },
                ...t.logs,
              ].slice(0, 20),
            }
          : t
      )
    );
  };

  const updateTicketStatus = (id: number, newStatus: string, isReject = false) => {
    const statusLabel = STATUS_TYPES.find((s) => s.id === newStatus)?.label ?? newStatus;
    setTeams((prev) =>
      prev.map((t) =>
        t.id === activeTeamId
          ? {
              ...t,
              tickets: t.tickets.map((tk) =>
                tk.id === id ? { ...tk, status: newStatus } : tk
              ),
            }
          : t
      )
    );
    addLog(id, currentUser!.name, isReject ? '반려 및 재요청' : `상태 변경(${statusLabel})`, isReject);
  };

  const createTicket = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser || !activeTeamId) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    const newTicket: Ticket = {
      id: Date.now(),
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      requester: currentUser.name,
      worker: formData.get('worker') as string,
      status: 'todo',
      createdAt: new Date()
        .toLocaleString('ko-KR', { hour12: false })
        .slice(0, -3),
      comments: [],
    };
    setTeams((prev) =>
      prev.map((t) =>
        t.id === activeTeamId ? { ...t, tickets: [newTicket, ...t.tickets] } : t
      )
    );
    addLog(newTicket.id, currentUser.name, '요청 발행(Todo)');
    setIsCreateModalOpen(false);
  };

  const addComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const text = (form.elements.namedItem('comment') as HTMLInputElement)?.value;
    if (!text || !selectedTicketId || !currentUser) return;
    setTeams((prev) =>
      prev.map((t) =>
        t.id === activeTeamId
          ? {
              ...t,
              tickets: t.tickets.map((tk) =>
                tk.id === selectedTicketId
                  ? {
                      ...tk,
                      comments: [
                        ...tk.comments,
                        {
                          id: Date.now(),
                          user: currentUser.name,
                          text,
                          time: new Date().toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          }),
                        },
                      ],
                    }
                  : tk
              ),
            }
          : t
      )
    );
    addLog(selectedTicketId, currentUser.name, '댓글 작성');
    form.reset();
  };

  const createNote = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser || !activeTeamId) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    const newNote: Note = {
      id: Date.now(),
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      author: currentUser.name,
      date: new Date().toISOString().split('T')[0],
    };
    setTeams((prev) =>
      prev.map((t) =>
        t.id === activeTeamId ? { ...t, notes: [newNote, ...t.notes] } : t
      )
    );
    setIsNoteModalOpen(false);
  };

  const createLink = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeTeamId) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    const newLink: TeamLink = {
      id: Date.now(),
      title: formData.get('title') as string,
      url: formData.get('url') as string,
      type: formData.get('type') as string,
    };
    setTeams((prev) =>
      prev.map((t) =>
        t.id === activeTeamId ? { ...t, links: [newLink, ...t.links] } : t
      )
    );
    setIsLinkModalOpen(false);
  };

  // --- Login screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/20">
              <LogIn size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter italic">
              i-Station
            </h1>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest opacity-80 mt-1">
              개인 계정 로그인
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-10 shadow-2xl">
            <form onSubmit={handlePersonalLogin} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-2">
                    <User size={12} /> 이름
                  </label>
                  <input
                    name="username"
                    required
                    className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-6 py-4 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="본명 입력"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-2">
                    <Briefcase size={12} /> 포지션
                  </label>
                  <input
                    name="position"
                    required
                    className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-6 py-4 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="ex. Frontend"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-2">
                  <AtSign size={12} /> 이메일
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-6 py-4 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="mail@istation.dev"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-2">
                  <Github size={12} /> 깃허브 (선택)
                </label>
                <input
                  name="github"
                  className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-6 py-4 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  placeholder="https://github.com/..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl text-lg"
              >
                시작하기 <ChevronRight size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- Team Lobby (no team selected or not authorized)
  if (!activeTeamId || !isTeamAuthorized) {
    const isMember = (team: Team) =>
      team.members.some((m) => m.name === currentUser.name);
    const matchSearch = (team: Team) =>
      !teamSearchQuery.trim() ||
      team.name.toLowerCase().includes(teamSearchQuery.trim().toLowerCase());

    const myTeams = teams.filter((t) => isMember(t) && matchSearch(t));
    const otherTeams = teams.filter((t) => !isMember(t) && matchSearch(t));

    const TeamCard = ({ team }: { team: Team }) => (
      <div
        onClick={() => {
          setActiveTeamId(team.id);
          setIsTeamAuthModalOpen(true);
        }}
        className="bg-white p-8 rounded-[40px] border-4 border-transparent hover:border-blue-500 hover:shadow-2xl transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
            🏢
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">
              {team.name}
            </h3>
            <p className="text-xs text-slate-400 font-bold flex items-center gap-1 mt-1">
              <Users size={12} /> {team.members.length}명의 멤버
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
          <div className="flex -space-x-2">
            {team.members.slice(0, 3).map((m, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold shadow-sm"
              >
                {m.avatar}
              </div>
            ))}
          </div>
          <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-colors">
            스페이스 입장
          </span>
        </div>
      </div>
    );

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col p-8 text-slate-800">
        <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col">
          <header className="flex justify-between items-start mb-8">
            <div className="flex flex-wrap items-end gap-8">
              <div>
                <h2 className="text-4xl font-black tracking-tight mb-2">
                  Team Lobby
                </h2>
                <p className="text-slate-500 font-bold">
                  {currentUser.name}님, 작업실을 선택하세요.
                </p>
              </div>
              <button
                onClick={() => setIsCreateTeamModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg transition-all active:scale-95"
              >
                <PlusCircle size={18} /> 새 팀 개설하기
              </button>
            </div>
            <button
              onClick={() => setCurrentUser(null)}
              className="text-slate-400 hover:text-red-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all py-2.5"
            >
              로그아웃 <LogOut size={14} />
            </button>
          </header>

          <div className="relative mb-8">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={teamSearchQuery}
              onChange={(e) => setTeamSearchQuery(e.target.value)}
              placeholder="팀 이름으로 검색..."
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-800 font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            {teamSearchQuery && (
              <button
                type="button"
                onClick={() => setTeamSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label="검색 초기화"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="flex-1 space-y-10">
            {myTeams.length > 0 && (
              <section>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">
                  참여 중인 팀
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myTeams.map((team) => (
                    <TeamCard key={team.id} team={team} />
                  ))}
                </div>
              </section>
            )}

            <section>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">
                {myTeams.length > 0 ? '입장 가능한 팀' : '팀 목록'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {otherTeams.map((team) => (
                  <TeamCard key={team.id} team={team} />
                ))}
              </div>
              {myTeams.length === 0 && otherTeams.length === 0 && (
                <p className="text-slate-400 font-medium py-8 text-center">
                  {teamSearchQuery
                    ? '검색 결과가 없습니다.'
                    : '참여할 팀이 없습니다. 새 팀을 개설해 보세요.'}
                </p>
              )}
              {myTeams.length > 0 && otherTeams.length === 0 && teamSearchQuery && (
                <p className="text-slate-400 font-medium py-4 text-center">
                  검색 결과가 없습니다.
                </p>
              )}
            </section>
          </div>
        </div>

        {isCreateTeamModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
            <div className="bg-white w-full max-w-md rounded-[48px] shadow-2xl p-10">
              <h3 className="text-2xl font-black text-slate-800 mb-8">
                새 팀 개설
              </h3>
              <form onSubmit={handleCreateTeam} className="space-y-6">
                <input
                  name="teamName"
                  required
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-lg font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="팀 이름"
                />
                <input
                  name="teamPassword"
                  required
                  type="password"
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-xl font-black outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="비밀번호"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-black py-5 rounded-3xl shadow-xl hover:bg-blue-700 transition-all"
                >
                  팀 생성 및 입장
                </button>
              </form>
            </div>
          </div>
        )}

        {isTeamAuthModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
            <div className="bg-white w-full max-w-md rounded-[48px] shadow-2xl p-10">
              <div className="mb-8">
                <h3 className="text-2xl font-black text-slate-800 mb-2">
                  보안 인증
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase">
                  비밀번호를 입력하세요
                </p>
              </div>
              <form onSubmit={handleTeamAuth} className="space-y-8">
                <input
                  name="password"
                  type="password"
                  required
                  autoFocus
                  className="w-full bg-slate-50 border-slate-100 rounded-3xl px-8 py-5 text-slate-900 text-center text-3xl font-black tracking-[0.5em] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  placeholder="••••"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-black py-5 rounded-3xl shadow-xl active:scale-95 transition-all"
                >
                  인증 및 입장
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Main app (team authorized)
  if (!activeTeam) return null;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 shrink-0">
          <button
            onClick={() => {
              setIsTeamAuthorized(false);
              setView('dashboard');
            }}
            className="group flex items-center gap-2 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
          >
            <ChevronRight
              size={14}
              className="rotate-180 group-hover:-translate-x-1 transition-transform"
            />{' '}
            Exit to Lobby
          </button>
          <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <LayoutDashboard size={20} /> i-Station
          </h1>
          <p className="text-[10px] text-slate-400 mt-1 font-black italic tracking-tighter truncate">
            {activeTeam.name}
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto min-h-0">
          <button
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              view === 'dashboard'
                ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-100'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard size={18} /> 칸반 보드
          </button>
          <button
            onClick={() => setView('members')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              view === 'members'
                ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-100'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Users size={18} /> 팀원 정보
          </button>
          <button
            onClick={() => setView('archive')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              view === 'archive'
                ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-100'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <FileText size={18} /> 아카이브
          </button>
        </nav>

        <div className="px-4 mb-4 shrink-0">
          <div className="bg-slate-50/80 rounded-2xl border border-slate-100 p-3">
            <div className="flex items-center gap-2 mb-3 px-1">
              <History size={14} className="text-blue-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Log
              </span>
            </div>
            <div className="space-y-3 max-h-[140px] overflow-y-auto pr-1 scrollbar-hide">
              {activeTeam.logs.map((log) => (
                <div
                  key={log.id}
                  className={`relative pl-3 border-l ${
                    log.isImportant
                      ? 'border-red-400 bg-red-50/50 rounded-r-md py-1'
                      : 'border-slate-200'
                  }`}
                >
                  <div
                    className={`absolute left-[-3.5px] top-1 w-1.5 h-1.5 rounded-full ${
                      log.isImportant ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                  />
                  <div className="flex justify-between items-start leading-none mb-1">
                    <span className="text-[10px] font-bold text-slate-700">
                      {log.user}
                    </span>
                    <span className="text-[8px] font-mono text-slate-400">
                      {log.time}
                    </span>
                  </div>
                  <p
                    className={`text-[9px] truncate ${
                      log.isImportant ? 'text-red-600 font-bold' : 'text-slate-500'
                    }`}
                  >
                    <span
                      className={`${
                        log.isImportant ? 'text-red-700' : 'text-blue-600'
                      } font-semibold mr-1`}
                    >
                      {log.ticketId > 0
                        ? `#${log.ticketId.toString().slice(-2)}`
                        : 'Entry'}
                    </span>
                    {log.action}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-[#0F172A] relative shrink-0">
          <div
            onClick={() => setIsStatusPickerOpen(!isStatusPickerOpen)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-slate-500 hover:bg-slate-900/60 group"
          >
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-xs">
                {currentUser.name[0]}
              </div>
            </div>
            <div className="flex-1 overflow-hidden min-w-0">
              <p className="text-sm font-bold truncate text-white">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-300 font-medium flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    activeTeam.userStatuses[currentUser.name]?.color ?? 'bg-green-500'
                  }`}
                />
                {activeTeam.userStatuses[currentUser.name]?.label ?? '활동 중'}
              </p>
            </div>
            <ChevronRight
              size={14}
              className={`text-slate-400 group-hover:text-blue-300 transition-transform shrink-0 ${
                isStatusPickerOpen ? 'rotate-90' : ''
              }`}
            />
          </div>
          {isStatusPickerOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50">
              <button
                onClick={() => {
                  setCurrentUser(null);
                  setActiveTeamId(null);
                  setIsTeamAuthorized(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 transition-colors mb-2 border-b border-slate-50"
              >
                <LogOut size={14} /> 시스템 로그아웃
              </button>
              {USER_ACTIVITIES.map((act) => (
                <button
                  key={act.label}
                  onClick={() => {
                    setTeams((prev) =>
                      prev.map((t) =>
                        t.id === activeTeamId
                          ? {
                              ...t,
                              userStatuses: {
                                ...t.userStatuses,
                                [currentUser.name]: act,
                              },
                            }
                          : t
                      )
                    );
                    setIsStatusPickerOpen(false);
                    addLog(0, currentUser.name, `상태: ${act.label}`);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTeam.userStatuses[currentUser.name]?.label === act.label
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${act.color}`} />{' '}
                  {act.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden text-slate-800">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2">
            {view === 'dashboard' && '🚀 칸반 보드'}
            {view === 'members' && '👥 팀원 정보'}
            {view === 'archive' && '📑 팀 아카이브'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2 mr-2">
              {onlineUsers.map((member) => (
                <div
                  key={member.name}
                  className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold shadow-sm relative group"
                  title={member.name}
                >
                  {member.avatar}
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${
                      activeTeam.userStatuses[member.name]?.color ?? 'bg-green-500'
                    }`}
                  />
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl font-bold tracking-tighter">
                    {member.name} (
                    {activeTeam.userStatuses[member.name]?.label ?? '활동 중'})
                  </div>
                </div>
              ))}
            </div>
            {view === 'dashboard' && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-md active:scale-95"
              >
                <Plus size={18} /> 새 요청
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 scrollbar-hide min-h-0">
          {view === 'dashboard' && (
            <div className="flex gap-6 h-full min-w-[1200px]">
              {STATUS_TYPES.map((status) => {
                const Icon = status.icon;
                const tickets = activeTeam.tickets.filter((t) => t.status === status.id);
                return (
                  <div
                    key={status.id}
                    className="flex-1 flex flex-col min-w-[280px] max-w-[360px]"
                  >
                    <div className="flex items-center justify-between p-4 mb-4 bg-white rounded-2xl shadow-sm border border-slate-100 shrink-0">
                      <div className="flex items-center gap-2 font-black text-slate-800">
                        <Icon size={20} className={status.color} /> {status.label}
                      </div>
                      <span className="w-6 h-6 bg-slate-50 text-slate-400 text-[10px] font-black rounded-full flex items-center justify-center">
                        {tickets.length}
                      </span>
                    </div>
                    <div className="flex-1 space-y-4 overflow-y-auto pb-4 scrollbar-hide min-h-0">
                      {tickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          onClick={() => setSelectedTicketId(ticket.id)}
                          className="bg-white p-5 rounded-[28px] border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group cursor-pointer relative shrink-0"
                        >
                          <h4 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-2 leading-tight">
                            {ticket.title}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                            {ticket.content}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mb-6">
                            <Clock size={12} /> {ticket.createdAt}
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="text-[11px] font-bold text-slate-400 min-w-0">
                              요청 : {ticket.requester}{' '}
                              <span className="mx-1 text-slate-200">|</span>{' '}
                              <span className="text-blue-600">
                                담당 : {ticket.worker}
                              </span>
                            </div>
                            {status.next && (
                              <div className="flex gap-1 shrink-0">
                                {status.back && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateTicketStatus(ticket.id, status.back!, true);
                                    }}
                                    className="px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-black rounded-xl hover:bg-red-100 transition-all"
                                  >
                                    반려
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateTicketStatus(ticket.id, status.next!);
                                  }}
                                  className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 flex items-center gap-1 active:scale-95 transition-all"
                                >
                                  {status.nextLabel} <ChevronRight size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="w-full py-4 bg-white/40 border-2 border-dashed border-slate-200 rounded-[28px] text-slate-400 font-bold text-xs hover:border-blue-300 hover:text-blue-500 hover:bg-white transition-all flex items-center justify-center gap-2 shrink-0"
                      >
                        + 새로운 요청 추가
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {view === 'members' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTeam.members.map((member) => (
                <div
                  key={member.name}
                  className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col items-center"
                >
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-4xl shadow-inner">
                      {member.avatar}
                    </div>
                    <span
                      className={`absolute bottom-1 right-1 w-5 h-5 border-4 border-white rounded-full ${
                        activeTeam.userStatuses[member.name]?.color ?? 'bg-green-500'
                      }`}
                    />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">
                    {member.name}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2">
                    {member.position}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 mb-6 flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        activeTeam.userStatuses[member.name]?.color ?? 'bg-green-500'
                      }`}
                    />
                    {activeTeam.userStatuses[member.name]?.label ?? '활동 중'}
                  </div>
                  <div className="w-full space-y-3 pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl text-[13px] font-medium text-slate-700">
                      <Mail size={16} className="text-slate-400 shrink-0" />{' '}
                      {member.email || '이메일 미등록'}
                    </div>
                    {member.github && (
                      <a
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-slate-900 rounded-2xl text-[13px] font-medium text-white hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Github size={16} className="text-slate-400 shrink-0" />{' '}
                          GitHub
                        </div>
                        <ArrowRight size={14} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {view === 'archive' && (
            <div className="flex flex-col gap-8 max-w-7xl mx-auto py-4">
              <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[450px]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shrink-0">
                      <LinkIcon size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">핵심 문서 & 퀵 링크</h3>
                      <p className="text-xs text-slate-400 font-medium">
                        기획서, 피그마, API 명세서 등 팀 공용 리소스
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsLinkModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold shadow-lg text-sm shrink-0"
                  >
                    <Plus size={18} /> 링크 추가
                  </button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto bg-slate-50/30 min-h-0">
                  {activeTeam.links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-purple-200 hover:shadow-md transition-all group text-slate-700 min-w-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${
                            link.type === 'planning'
                              ? 'bg-orange-400'
                              : link.type === 'dev'
                                ? 'bg-blue-400'
                                : 'bg-slate-400'
                          }`}
                        >
                          {link.type === 'planning' ? (
                            <FileText size={18} />
                          ) : link.type === 'dev' ? (
                            <FileCode size={18} />
                          ) : (
                            <LinkIcon size={18} />
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <span className="text-sm font-bold block truncate group-hover:text-purple-600">
                            {link.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono truncate block">
                            {new URL(link.url).hostname}
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">간편 회의록</h3>
                      <p className="text-xs text-slate-400 font-medium">
                        결정 사항 중심의 가벼운 마크다운 기록장
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsNoteModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-95 text-sm shrink-0"
                  >
                    <Plus size={18} /> 회의록 작성
                  </button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto min-h-0">
                  {activeTeam.notes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => setSelectedNote(note)}
                      className="p-6 rounded-3xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-blue-200 hover:shadow-xl transition-all cursor-pointer group flex flex-col h-[200px]"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                          {note.date}
                        </span>
                        <Eye
                          size={16}
                          className="text-slate-300 group-hover:text-blue-500 transition-colors shrink-0"
                        />
                      </div>
                      <h4 className="font-bold text-base group-hover:text-blue-600 mb-2 truncate">
                        {note.title}
                      </h4>
                      <div className="text-xs text-slate-500 line-clamp-4 leading-relaxed overflow-hidden flex-1 min-h-0">
                        {note.content.replace(/[#*]/g, '')}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      {/* Ticket detail modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-xl rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <header className="p-8 flex justify-between items-start shrink-0">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-200 shrink-0">
                  #{activeTeam.tickets.indexOf(selectedTicket) + 1}
                </div>
                <div className="min-w-0">
                  <h3 className="text-2xl font-black text-slate-900 leading-tight truncate">
                    {selectedTicket.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      STATUS:
                    </span>
                    <span className="text-[10px] font-black text-blue-600 uppercase">
                      {selectedTicket.status}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedTicketId(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-all shrink-0"
              >
                <X size={28} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-8 scrollbar-hide min-h-0">
              <div className="bg-slate-50/50 p-8 rounded-[32px] border border-slate-100">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mb-6">
                  <Clock size={12} /> {selectedTicket.createdAt} 발행
                </div>
                <div className="text-sm text-slate-600 leading-relaxed mb-8">
                  {selectedTicket.content}
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-center gap-8">
                  <div className="text-center">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">
                      REQUESTER
                    </p>
                    <p className="font-black text-slate-800">
                      {selectedTicket.requester}
                    </p>
                  </div>
                  <ArrowRight size={20} className="text-slate-200 shrink-0" />
                  <div className="text-center">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">
                      WORKER
                    </p>
                    <p className="font-black text-blue-600">
                      {selectedTicket.worker}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  진행 상태 변경
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {STATUS_TYPES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => updateTicketStatus(selectedTicket.id, s.id)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all font-bold text-xs ${
                        selectedTicket.status === s.id
                          ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-lg shadow-blue-100'
                          : 'border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <s.icon size={16} className="shrink-0" /> {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  커뮤니케이션
                </p>
                <div className="space-y-4">
                  {selectedTicket.comments.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                        {c.user[0]}
                      </div>
                      <div className="flex-1 bg-slate-50 p-4 rounded-2xl rounded-tl-none text-xs text-slate-600 leading-relaxed min-w-0">
                        {c.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-white shrink-0">
              <form onSubmit={addComment} className="relative">
                <input
                  name="comment"
                  className="w-full bg-slate-100 border-none rounded-2xl px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  placeholder="피드백이나 질문을 남겨주세요..."
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* New request modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl p-10">
            <h3 className="text-2xl font-black mb-8">새로운 요청 발행</h3>
            <form onSubmit={createTicket} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  업무 타이틀
                </label>
                <input
                  name="title"
                  required
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-lg font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="업무 핵심 주제"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  담당자 선택
                </label>
                <select
                  name="worker"
                  required
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                >
                  {activeTeam.members
                    .filter((m) => m.name !== currentUser.name)
                    .map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  상세 내용
                </label>
                <textarea
                  name="content"
                  required
                  rows={4}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="수정 사항을 상세히 입력하세요."
                />
              </div>
              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl text-sm font-black"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl text-sm font-black shadow-xl hover:bg-blue-700 transition-all"
                >
                  요청 발행 (Todo)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New note modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl p-10">
            <h3 className="text-2xl font-black mb-8">팀 노트 작성</h3>
            <form onSubmit={createNote} className="space-y-6">
              <input
                name="title"
                required
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-lg font-bold outline-none"
                placeholder="노트 제목"
              />
              <textarea
                name="content"
                required
                rows={6}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm outline-none resize-none"
                placeholder="내용 입력"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-black py-5 rounded-3xl shadow-xl hover:bg-blue-700 transition-all"
              >
                기록하기
              </button>
            </form>
          </div>
        </div>
      )}

      {/* New link modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl p-10">
            <h3 className="text-2xl font-black mb-8">새 링크 추가</h3>
            <form onSubmit={createLink} className="space-y-6">
              <input
                name="title"
                required
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-lg font-bold outline-none"
                placeholder="링크 이름"
              />
              <input
                name="url"
                required
                type="url"
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm outline-none font-mono"
                placeholder="https://..."
              />
              <select
                name="type"
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold outline-none"
              >
                <option value="planning">기획</option>
                <option value="dev">개발</option>
                <option value="design">디자인</option>
              </select>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-black py-5 rounded-3xl shadow-xl hover:bg-blue-700 transition-all"
              >
                링크 등록
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Note detail modal (React-Markdown for 회의록) */}
      {selectedNote && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-start shrink-0">
              <div>
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                  {selectedNote.date}
                </span>
                <h3 className="text-3xl font-black text-slate-800 mt-1">
                  {selectedNote.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNote(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-all"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-white scrollbar-hide min-h-0">
              <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed prose-headings:text-slate-800 prose-p:text-slate-600 prose-ul:text-slate-600">
                <ReactMarkdown>{selectedNote.content}</ReactMarkdown>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 text-center shrink-0">
              <button
                onClick={() => setSelectedNote(null)}
                className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all"
              >
                확인 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
