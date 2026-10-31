import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Calendar, Clock, CheckCircle, BarChart2, Settings, Plus, Trash2, 
  Play, Pause, RotateCcw, LogOut, ArrowRight, ArrowLeft, Check, RefreshCw, Brain, ShieldAlert
} from 'lucide-react';

const readStorageJson = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;

  try {
    const saved = window.localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeStorageJson = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors in restricted environments.
  }
};

const removeStorageItem = (key: string) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage errors in restricted environments.
  }
};

// Custom StudyFlow SVG Logo Icon based on the provided design
function StudyFlowLogoIcon({ className = "w-10 h-10", iconOnly = false }: { className?: string; iconOnly?: boolean }) {
  return (
    <div className={`inline-flex items-center gap-3 select-none`}>
      <svg 
        className={className} 
        viewBox="0 0 200 200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left Book Pages */}
        <path 
          d="M 35 65 V 140 C 35 140, 60 130, 95 145 V 70 C 60 55, 35 65, 35 65 Z" 
          fill="#002B2B" 
          stroke="#218363" 
          strokeWidth="3"
        />
        <path 
          d="M 50 55 V 130 C 50 130, 70 122, 95 135 V 60 C 70 48, 50 55, 50 55 Z" 
          fill="#0B5753" 
        />
        <path 
          d="M 65 45 V 120 C 65 120, 80 115, 95 125 V 50 C 80 40, 65 45, 65 45 Z" 
          fill="#218363" 
        />

        {/* Dynamic Upward Flow Arrow (Right Side) */}
        <path 
          d="M 95 145 C 130 160, 165 130, 150 90 C 140 65, 110 70, 110 50 C 110 35, 130 30, 155 45" 
          stroke="#8DBB98" 
          strokeWidth="14" 
          strokeLinecap="round" 
          fill="none" 
        />
        <path 
          d="M 130 110 C 145 125, 175 105, 160 65 L 175 45 L 145 40 L 140 68 L 152 58 C 162 88, 140 108, 125 95 Z" 
          fill="#8DBB98" 
        />
        {/* Arrow Tip */}
        <polygon points="160,30 185,50 150,60" fill="#8DBB98" />
      </svg>
      {!iconOnly && (
        <span className="font-sans tracking-tight font-extrabold text-2xl text-[#8DBB98]">
          Study<span className="text-white">Flow</span>
        </span>
      )}
    </div>
  );
}

export default function App() {
  // Current User State
  const [currentUser, setCurrentUser] = useState(() => {
    return readStorageJson<typeof currentUser>('studyflow_user', null);
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Onboarding Wizard State
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(() => {
    return readStorageJson('studyflow_onboarding_done', 'false') === 'true';
  });

  // User Profile Form State during Onboarding/Auth
  const [userInfo, setUserInfo] = useState(() => {
    return currentUser || {
      name: '',
      email: '',
      educationLevel: 'sec', // pri, prep, sec, uni
      academicYear: 'الصف الثالث الثانوي',
    };
  });

  // Educational Levels Options
  const educationLevels = [
    { id: 'pri', name: 'المرحلة الإبتدائية', defaultWeight: 1 },
    { id: 'prep', name: 'المرحلة الإعدادية', defaultWeight: 1.2 },
    { id: 'sec', name: 'المرحلة الثانوية (عامة / أزهرية)', defaultWeight: 1.8 },
    { id: 'uni', name: 'المرحلة الجامعية', defaultWeight: 1.6 }
  ];

  // Academic Years Options by Level
  const academicYearOptions: Record<string, string[]> = {
    pri: ['الصف الرابع', 'الصف الخامس', 'الصف السادس'],
    prep: ['الصف الأول الإعدادي', 'الصف الثاني الإعدادي', 'الصف الثالث الإعدادي'],
    sec: ['الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'],
    uni: ['السنة الأولى', 'السنة الثانية', 'السنة الثالثة', 'السنة الرابعة / النهائية']
  };

  // Subjects & Busy Times State
  const [subjects, setSubjects] = useState(() => {
    return readStorageJson('studyflow_subjects', [
      { id: '1', name: 'الفيزياء', color: '#0B5753', difficulty: 'hard', importance: 'high', weeklyHours: 10, icon: '⚡' },
      { id: '2', name: 'الرياضيات التطبيقية', color: '#218363', difficulty: 'hard', importance: 'high', weeklyHours: 12, icon: '📐' },
      { id: '3', name: 'اللغة العربية', color: '#8DBB98', difficulty: 'medium', importance: 'medium', weeklyHours: 8, icon: '📖' },
      { id: '4', name: 'الكيمياء', color: '#002B2B', difficulty: 'hard', importance: 'high', weeklyHours: 9, icon: '🧪' }
    ]);
  });

  const [busyTimes, setBusyTimes] = useState(() => {
    return readStorageJson('studyflow_busy', [
      { id: 'b1', title: 'وقت الدوام المدرسي / الجامعي', startTime: '07:30', endTime: '14:00', icon: 'school' },
      { id: 'b2', title: 'النوم والراحة اليومية', startTime: '23:00', endTime: '06:30', icon: 'sleep' },
      { id: 'b3', title: 'المواصلات والتنقل', startTime: '14:00', endTime: '14:45', icon: 'bus' }
    ]);
  });

  // Exams State
  const [exams, setExams] = useState(() => {
    return readStorageJson('studyflow_exams', [
      { id: 'e1', subject: 'الفيزياء', date: '2026-11-15', title: 'اختبار منتصف الفصل', priority: 'عالية جداً' },
      { id: 'e2', subject: 'الرياضيات التطبيقية', date: '2026-11-20', title: 'امتحان الشامل', priority: 'عالية' }
    ]);
  });

  // Schedule Generated State
  const [scheduleTasks, setScheduleTasks] = useState<any[]>(() => {
    return readStorageJson('studyflow_tasks', []);
  });

  // Pomodoro & Focus Mode State
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeTaskSubject, setActiveTaskSubject] = useState('الفيزياء');
  const [distractions, setDistractions] = useState<any[]>([]);
  const [newDistractionText, setNewDistractionText] = useState('');

  // Onboarding Form Temporary Inputs
  const [newSubjectInput, setNewSubjectInput] = useState({ name: '', color: '#0B5753', difficulty: 'medium', importance: 'medium', icon: '📚' });
  const [newBusyInput, setNewBusyInput] = useState({ title: '', startTime: '15:00', endTime: '16:30' });
  const [newExamInput, setNewExamInput] = useState({ subject: '', date: '', title: '' });

  // Save changes to localStorage & Auto-Replan on change
  useEffect(() => {
    if (currentUser) writeStorageJson('studyflow_user', currentUser);
    writeStorageJson('studyflow_subjects', subjects);
    writeStorageJson('studyflow_busy', busyTimes);
    writeStorageJson('studyflow_exams', exams);
    writeStorageJson('studyflow_onboarding_done', String(isOnboardingComplete));
  }, [currentUser, subjects, busyTimes, exams, isOnboardingComplete]);

  useEffect(() => {
    writeStorageJson('studyflow_tasks', scheduleTasks);
  }, [scheduleTasks]);

  // Pomodoro Countdown Effect
  useEffect(() => {
    let timer: any = null;
    if (isTimerRunning && pomodoroTime > 0) {
      timer = setInterval(() => {
        setPomodoroTime(prev => prev - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, pomodoroTime]);

  // Helper function to format time (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Dynamic Adaptive Scheduling Engine based on Grade Level and Subject Importance
  const generateDynamicSchedule = () => {
    if (!subjects.length) return;

    // Calculate level multiplier
    const currentLevelObj = educationLevels.find(l => l.id === userInfo.educationLevel) || educationLevels[2];
    const levelMultiplier = currentLevelObj.defaultWeight;

    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الخميس', 'السبت'];
    const generated = [];
    let idCounter = 1;

    // Sort subjects by priority/difficulty
    const sortedSubjects = [...subjects].sort((a, b) => {
      const impScore: Record<string, number> = { high: 3, medium: 2, low: 1 };
      const diffScore: Record<string, number> = { hard: 3, medium: 2, easy: 1 };
      return (impScore[b.importance] + diffScore[b.difficulty]) - (impScore[a.importance] + diffScore[a.difficulty]);
    });

    days.forEach((day, dayIndex) => {
      // Allocate 2 to 3 main study sessions based on Level
      const sessionsCount = Math.min(3, Math.ceil(levelMultiplier * 1.5));

      for (let s = 0; s < sessionsCount; s++) {
        const subj = sortedSubjects[(dayIndex + s) % sortedSubjects.length];
        
        // Duration dynamic based on level & subject difficulty
        let durationMinutes = 45;
        if (subj.difficulty === 'hard') durationMinutes = Math.round(60 * levelMultiplier);
        else if (subj.difficulty === 'medium') durationMinutes = Math.round(45 * levelMultiplier);

        const startHour = 16 + (s * 2);
        const timeSlot = `${startHour}:00 - ${startHour + 1}:30`;

        generated.push({
          id: `task-${idCounter++}`,
          day,
          subject: subj.name,
          subjectColor: subj.color,
          importance: subj.importance,
          time: timeSlot,
          type: subj.difficulty === 'hard' ? 'حل تمارين واختبارات' : 'مذاكرة وتلخيص',
          status: 'قادم',
          duration: `${durationMinutes} دقيقة`,
          completed: false
        });
      }
    });

    setScheduleTasks(generated);
  };

  // Dynamic Rescheduler
  const triggerSmartReschedule = () => {
    const updated = scheduleTasks.map((t) => {
      if (!t.completed) {
        return {
          ...t,
          status: 'تمت إعادة الجدولة بذكاء ✨',
          time: 'معدل - الفترة الذهبية التالية'
        };
      }
      return t;
    });
    setScheduleTasks(updated);
  };

  // Auth Handler
  const handleStartPlatform = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo.name.trim() || !userInfo.email.trim()) return;
    setCurrentUser(userInfo);
    setOnboardingStep(1);
    setIsOnboardingComplete(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    removeStorageItem('studyflow_user');
    setIsOnboardingComplete(false);
  };

  // Subject Management
  const handleAddSubject = () => {
    if (!newSubjectInput.name.trim()) return;
    const item = {
      id: Date.now().toString(),
      name: newSubjectInput.name,
      color: newSubjectInput.color,
      difficulty: newSubjectInput.difficulty,
      importance: newSubjectInput.importance,
      weeklyHours: newSubjectInput.difficulty === 'hard' ? 10 : 6,
      icon: newSubjectInput.icon
    };
    setSubjects(prev => [...prev, item]);
    setNewSubjectInput({ name: '', color: '#0B5753', difficulty: 'medium', importance: 'medium', icon: '📚' });
  };

  const handleRemoveSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  // Busy Time Management
  const handleAddBusy = () => {
    if (!newBusyInput.title.trim()) return;
    const item = {
      id: Date.now().toString(),
      title: newBusyInput.title,
      startTime: newBusyInput.startTime,
      endTime: newBusyInput.endTime
    };
    setBusyTimes(prev => [...prev, item]);
    setNewBusyInput({ title: '', startTime: '15:00', endTime: '16:30' });
  };

  const handleRemoveBusy = (id: string) => {
    setBusyTimes(prev => prev.filter(b => b.id !== id));
  };

  // Exam Management
  const handleAddExam = () => {
    if (!newExamInput.subject || !newExamInput.date) return;
    const item = {
      id: Date.now().toString(),
      subject: newExamInput.subject,
      date: newExamInput.date,
      title: newExamInput.title || 'اختبار تقييمي',
      priority: 'عالية'
    };
    setExams(prev => [...prev, item]);
    setNewExamInput({ subject: '', date: '', title: '' });
  };

  // Finish Onboarding
  const finishOnboarding = () => {
    generateDynamicSchedule();
    setIsOnboardingComplete(true);
    setActiveTab('dashboard');
  };

  // Distraction logger
  const handleAddDistraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDistractionText.trim()) return;
    setDistractions(prev => [...prev, { id: Date.now(), text: newDistractionText, time: new Date().toLocaleTimeString('ar-EG') }]);
    setNewDistractionText('');
  };

  // Toggle Task Completion
  const toggleTaskComplete = (taskId: string) => {
    setScheduleTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  // -------------------------------------------------------------
  // 1. AUTH SCREEN (IF NOT LOGGED IN)
  // -------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#002B2B] text-white flex items-center justify-center p-4 font-sans" dir="rtl">
        <div className="bg-[#0B5753] p-8 rounded-3xl shadow-2xl w-full max-w-lg border border-[#218363]">
          
          {/* Main Logo & Title Header */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="p-4 bg-[#002B2B]/60 rounded-3xl border border-[#218363] shadow-lg mb-4 flex items-center justify-center">
              <StudyFlowLogoIcon className="w-16 h-16" iconOnly={true} />
            </div>
            <h1 className="text-3xl font-extrabold text-[#8DBB98] tracking-wide">منصة StudyFlow</h1>
            <p className="text-sm text-emerald-100 mt-2">المساعد الذكي لتنظيم المذاكرة المكيّف بحسب مرحلتك الدراسية</p>
          </div>

          <form onSubmit={handleStartPlatform} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-emerald-100">الاسم الكامل</label>
              <input 
                type="text" 
                required
                value={userInfo.name} 
                onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                placeholder="مثال: أحمد محمود" 
                className="w-full p-3 rounded-xl bg-[#002B2B] border border-[#218363] text-white placeholder-emerald-400 focus:outline-none focus:ring-2 focus:ring-[#8DBB98]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-emerald-100">البريد الإلكتروني</label>
              <input 
                type="email" 
                required
                value={userInfo.email} 
                onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                placeholder="example@student.com" 
                className="w-full p-3 rounded-xl bg-[#002B2B] border border-[#218363] text-white placeholder-emerald-400 focus:outline-none focus:ring-2 focus:ring-[#8DBB98]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-emerald-100">المرحلة الدراسية</label>
                <select
                  value={userInfo.educationLevel}
                  onChange={(e) => setUserInfo({
                    ...userInfo, 
                    educationLevel: e.target.value,
                    academicYear: academicYearOptions[e.target.value][0]
                  })}
                  className="w-full p-3 rounded-xl bg-[#002B2B] border border-[#218363] text-white focus:outline-none focus:ring-2 focus:ring-[#8DBB98]"
                >
                  {educationLevels.map(lvl => (
                    <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-emerald-100">السنة الدراسية</label>
                <select
                  value={userInfo.academicYear}
                  onChange={(e) => setUserInfo({...userInfo, academicYear: e.target.value})}
                  className="w-full p-3 rounded-xl bg-[#002B2B] border border-[#218363] text-white focus:outline-none focus:ring-2 focus:ring-[#8DBB98]"
                >
                  {academicYearOptions[userInfo.educationLevel]?.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full mt-4 bg-[#218363] hover:bg-[#8DBB98] hover:text-[#002B2B] text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>البدء وإعداد الجدول التكيفي</span>
              <ArrowLeft className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. ONBOARDING WIZARD (MULTI-STEP SETUP)
  // -------------------------------------------------------------
  if (!isOnboardingComplete) {
    return (
      <div className="min-h-screen bg-[#002B2B] text-white flex items-center justify-center p-4 font-sans" dir="rtl">
        <div className="bg-[#0B5753] rounded-3xl shadow-2xl w-full max-w-3xl border border-[#218363] overflow-hidden flex flex-col">
          
          {/* Header & Logo */}
          <div className="p-6 bg-[#002B2B] border-b border-[#218363]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <StudyFlowLogoIcon className="w-10 h-10" iconOnly={true} />
                <div>
                  <h2 className="text-xl font-bold text-[#8DBB98]">أهلاً بك يا {currentUser.name} 👋</h2>
                  <p className="text-xs text-emerald-200">لنقم بإعداد خطتك المخصصة لـ ({currentUser.academicYear})</p>
                </div>
              </div>
              <button onClick={finishOnboarding} className="text-xs text-emerald-300 hover:underline">
                تخطي وبدء الجدول مباشرة
              </button>
            </div>

            {/* Stepper Progress */}
            <div className="flex items-center justify-between relative max-w-lg mx-auto my-3">
              <div className="absolute left-0 right-0 top-1/2 h-1 bg-[#0B5753] -z-0 transform -translate-y-1/2"></div>
              <div 
                className="absolute right-0 top-1/2 h-1 bg-[#8DBB98] -z-0 transform -translate-y-1/2 transition-all duration-300" 
                style={{ width: onboardingStep === 1 ? '0%' : onboardingStep === 2 ? '50%' : '100%' }}
              ></div>

              {[1, 2, 3].map(step => (
                <div 
                  key={step}
                  className={`w-9 h-9 rounded-full flex items-center justify-center z-10 text-sm font-bold transition-all ${
                    onboardingStep >= step ? 'bg-[#8DBB98] text-[#002B2B]' : 'bg-[#0B5753] text-gray-300'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-emerald-200 max-w-lg mx-auto px-1">
              <span>أوقات الانشغال والالتزامات</span>
              <span>المواد ومدى صعوبتها</span>
              <span>الامتحانات والتفضيلات</span>
            </div>
          </div>

          {/* STEP 1: BUSY HOURS */}
          {onboardingStep === 1 && (
            <div className="p-6 flex-1 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#8DBB98] mb-1">الخطوة 1: الفترات الثابتة وأوقات عدم التفرغ</h3>
                <p className="text-sm text-emerald-100">حدد أوقات المدرسة، النوم، والمواصلات ليتجنب الذكاء الاصطناعي الجدولة فيها.</p>
              </div>

              <div className="bg-[#002B2B] p-4 rounded-xl border border-[#218363] space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input 
                    type="text" 
                    placeholder="سبب الانشغال (مثل: وقت الدروس أو التمرين)..." 
                    value={newBusyInput.title}
                    onChange={(e) => setNewBusyInput({...newBusyInput, title: e.target.value})}
                    className="bg-[#0B5753] p-2.5 rounded-lg text-sm text-white placeholder-emerald-300 border border-[#218363] focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <input 
                      type="time" 
                      value={newBusyInput.startTime}
                      onChange={(e) => setNewBusyInput({...newBusyInput, startTime: e.target.value})}
                      className="bg-[#0B5753] p-2.5 rounded-lg text-sm text-white border border-[#218363] flex-1"
                    />
                    <span className="text-xs text-emerald-200">إلى</span>
                    <input 
                      type="time" 
                      value={newBusyInput.endTime}
                      onChange={(e) => setNewBusyInput({...newBusyInput, endTime: e.target.value})}
                      className="bg-[#0B5753] p-2.5 rounded-lg text-sm text-white border border-[#218363] flex-1"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleAddBusy}
                  className="w-full bg-[#218363] hover:bg-[#8DBB98] hover:text-[#002B2B] py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" /> إضافة الفترة
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {busyTimes.map((b) => (
                  <div key={b.id} className="flex justify-between items-center bg-[#002B2B]/60 p-3 rounded-xl border border-[#218363]/40">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-[#8DBB98]" />
                      <span className="font-semibold text-white text-sm">{b.title}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-emerald-200">
                      <span>من {b.startTime} إلى {b.endTime}</span>
                      <button onClick={() => handleRemoveBusy(b.id)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: SUBJECTS & DIFFICULTY */}
          {onboardingStep === 2 && (
            <div className="p-6 flex-1 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#8DBB98] mb-1">الخطوة 2: إضافة المواد وتقييم صعوبتها</h3>
                <p className="text-sm text-emerald-100">سوف يعطي المحرك أولوية وأوقات أطول للمواد ذات الصعوبة والأهمية العالية.</p>
              </div>

              <div className="bg-[#002B2B] p-4 rounded-xl border border-[#218363] space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input 
                    type="text" 
                    placeholder="اسم المادة..." 
                    value={newSubjectInput.name}
                    onChange={(e) => setNewSubjectInput({...newSubjectInput, name: e.target.value})}
                    className="bg-[#0B5753] p-2 rounded-lg text-sm text-white placeholder-emerald-300 border border-[#218363] focus:outline-none"
                  />
                  <select 
                    value={newSubjectInput.difficulty}
                    onChange={(e) => setNewSubjectInput({...newSubjectInput, difficulty: e.target.value})}
                    className="bg-[#0B5753] p-2 rounded-lg text-sm text-white border border-[#218363]"
                  >
                    <option value="easy">سهلة / مراجعة</option>
                    <option value="medium">متوسطة الصعوبة</option>
                    <option value="hard">صعبة للغاية / تحتاج تركيز</option>
                  </select>
                  <select 
                    value={newSubjectInput.importance}
                    onChange={(e) => setNewSubjectInput({...newSubjectInput, importance: e.target.value})}
                    className="bg-[#0B5753] p-2 rounded-lg text-sm text-white border border-[#218363]"
                  >
                    <option value="low">أهمية عادية</option>
                    <option value="medium">أهمية متوسطة</option>
                    <option value="high">أهمية قصوى (مادة رئيسية)</option>
                  </select>
                </div>
                <button 
                  onClick={handleAddSubject}
                  className="w-full bg-[#218363] hover:bg-[#8DBB98] hover:text-[#002B2B] py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" /> إضافة المادة للتحليل
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {subjects.map((s) => (
                  <div key={s.id} className="flex justify-between items-center bg-[#002B2B]/60 p-3 rounded-xl border border-[#218363]/40">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{s.icon}</span>
                      <div>
                        <p className="font-semibold text-white text-sm">{s.name}</p>
                        <p className="text-xs text-emerald-300">
                          الصعوبة: {s.difficulty === 'hard' ? 'صعبة' : 'متوسطة'} | الأهمية: {s.importance === 'high' ? 'قصوى' : 'عادية'}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveSubject(s.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: EXAMS & GENERATE */}
          {onboardingStep === 3 && (
            <div className="p-6 flex-1 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#8DBB98] mb-1">الخطوة 3: تحديد مواعيد الامتحانات القادمة</h3>
                <p className="text-sm text-emerald-100">يساعد المحرك في تكثيف مراجعة المادة قبل موعد اختبارها.</p>
              </div>

              <div className="bg-[#002B2B] p-4 rounded-xl border border-[#218363] space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <select 
                    value={newExamInput.subject}
                    onChange={(e) => setNewExamInput({...newExamInput, subject: e.target.value})}
                    className="bg-[#0B5753] p-2 rounded-lg text-sm text-white border border-[#218363]"
                  >
                    <option value="">اختر المادة...</option>
                    {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                  <input 
                    type="date" 
                    value={newExamInput.date}
                    onChange={(e) => setNewExamInput({...newExamInput, date: e.target.value})}
                    className="bg-[#0B5753] p-2 rounded-lg text-sm text-white border border-[#218363]"
                  />
                  <input 
                    type="text" 
                    placeholder="عنوان الاختبار..." 
                    value={newExamInput.title}
                    onChange={(e) => setNewExamInput({...newExamInput, title: e.target.value})}
                    className="bg-[#0B5753] p-2 rounded-lg text-sm text-white border border-[#218363]"
                  />
                </div>
                <button 
                  onClick={handleAddExam}
                  className="w-full bg-[#218363] hover:bg-[#8DBB98] hover:text-[#002B2B] py-2 rounded-lg text-sm font-bold"
                >
                  حفظ ميعاد الامتحان
                </button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {exams.map((ex) => (
                  <div key={ex.id} className="flex justify-between items-center bg-[#002B2B]/60 p-3 rounded-xl border border-[#218363]/40">
                    <div>
                      <p className="font-bold text-white text-sm">{ex.subject} - {ex.title}</p>
                      <p className="text-xs text-emerald-300">الموعد: {ex.date}</p>
                    </div>
                    <span className="text-xs bg-[#218363] px-2 py-1 rounded text-white">مهم جداً</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stepper Footer Controls */}
          <div className="p-4 bg-[#002B2B] border-t border-[#218363] flex justify-between items-center">
            {onboardingStep > 1 ? (
              <button 
                onClick={() => setOnboardingStep(onboardingStep - 1)}
                className="bg-[#0B5753] hover:bg-[#218363] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1"
              >
                <ArrowRight className="w-4 h-4" /> السابق
              </button>
            ) : <div />}

            {onboardingStep < 3 ? (
              <button 
                onClick={() => setOnboardingStep(onboardingStep + 1)}
                className="bg-[#218363] hover:bg-[#8DBB98] hover:text-[#002B2B] text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-1"
              >
                التالي <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={finishOnboarding}
                className="bg-[#8DBB98] hover:bg-emerald-300 text-[#002B2B] px-6 py-2 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2"
              >
                <span>توليد الجدول التكيفي الذكي</span>
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. MAIN DASHBOARD APPLICATION
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#002B2B] text-white font-sans flex flex-col md:flex-row" dir="rtl">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0B5753] p-4 flex flex-col justify-between border-l border-[#218363]">
        <div>
          {/* Main Sidebar Brand & Logo */}
          <div className="flex items-center gap-3 mb-8 p-2 bg-[#002B2B]/40 rounded-2xl border border-[#218363]">
            <StudyFlowLogoIcon className="w-9 h-9" iconOnly={true} />
            <div>
              <h1 className="text-lg font-bold text-[#8DBB98] leading-tight">StudyFlow</h1>
              <p className="text-[11px] text-emerald-200">{currentUser.name} • {currentUser.academicYear}</p>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: 'لوحة التحكم والتقدم', icon: BarChart2 },
              { id: 'schedule', label: 'الجدول التكيفي', icon: Calendar },
              { id: 'focus', label: 'وضع التركيز وبومودورو', icon: Brain },
              { id: 'subjects', label: 'إدارة المواد والامتحانات', icon: BookOpen },
              { id: 'busy', label: 'أوقات الانشغال والنوم', icon: Clock },
              { id: 'settings', label: 'الإعدادات والمرحلة', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm ${
                    activeTab === item.id 
                      ? 'bg-[#218363] text-white shadow-md' 
                      : 'text-emerald-100 hover:bg-[#002B2B]/40'
                  }`}
                >
                  <Icon className="w-5 h-5 text-[#8DBB98]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-[#218363]/40">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-300 hover:bg-red-900/20 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        
        {/* 1. DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0B5753] p-6 rounded-2xl border border-[#218363]">
              <div>
                <h2 className="text-2xl font-bold text-[#8DBB98]">أهلاً بك، جاهز للمذاكرة اليوم؟ 🚀</h2>
                <p className="text-sm text-emerald-100 mt-1">
                  تم تخصيص الخطة بناءً على صعوبة مواد {currentUser.academicYear} وتفادي أوقات انشغالك.
                </p>
              </div>
              <button 
                onClick={triggerSmartReschedule}
                className="bg-[#218363] hover:bg-[#8DBB98] hover:text-[#002B2B] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة تنظيم الخطة عند التأخر</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-[#0B5753]/60 p-4 rounded-xl border border-[#218363]">
                <p className="text-xs text-emerald-200">المرحلة الحالية</p>
                <p className="text-lg font-bold text-[#8DBB98] mt-1">{currentUser.academicYear}</p>
              </div>
              <div className="bg-[#0B5753]/60 p-4 rounded-xl border border-[#218363]">
                <p className="text-xs text-emerald-200">إجمالي المواد الدراسية</p>
                <p className="text-xl font-bold text-[#8DBB98] mt-1">{subjects.length} مواد</p>
              </div>
              <div className="bg-[#0B5753]/60 p-4 rounded-xl border border-[#218363]">
                <p className="text-xs text-emerald-200">المهام المكتملة اليوم</p>
                <p className="text-xl font-bold text-[#8DBB98] mt-1">
                  {scheduleTasks.filter(t => t.completed).length} / {scheduleTasks.length}
                </p>
              </div>
              <div className="bg-[#0B5753]/60 p-4 rounded-xl border border-[#218363]">
                <p className="text-xs text-emerald-200">الامتحانات القادمة</p>
                <p className="text-xl font-bold text-[#8DBB98] mt-1">{exams.length} اختبارات</p>
              </div>
            </div>

            {/* Today's Tasks Dynamic List */}
            <div className="bg-[#0B5753] p-6 rounded-2xl border border-[#218363]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-[#8DBB98]">مهام المذاكرة الموصى بها اليوم</h3>
                <span className="text-xs text-emerald-200">مرتبة حسب أهمية المادة وقرب الامتحانات</span>
              </div>

              <div className="space-y-3">
                {scheduleTasks.length === 0 ? (
                  <p className="text-sm text-emerald-200 text-center py-4">انقر على توليد الجدول في الإعدادات لإنشاء المهام تلقائياً.</p>
                ) : (
                  scheduleTasks.slice(0, 5).map((task) => (
                    <div 
                      key={task.id} 
                      className={`p-4 rounded-xl border transition-all flex justify-between items-center ${
                        task.completed ? 'bg-[#002B2B]/40 border-gray-600 opacity-60' : 'bg-[#002B2B] border-[#218363]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => toggleTaskComplete(task.id)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                            task.completed ? 'bg-[#8DBB98] text-[#002B2B] border-[#8DBB98]' : 'border-emerald-400'
                          }`}
                        >
                          {task.completed && <Check className="w-4 h-4 font-bold" />}
                        </button>
                        <div>
                          <h4 className={`font-bold text-sm ${task.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                            {task.subject}
                          </h4>
                          <p className="text-xs text-emerald-200">{task.type} • {task.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-[#0B5753] px-3 py-1 rounded-full text-emerald-100 border border-[#218363]">{task.time}</span>
                        <button 
                          onClick={() => { setActiveTaskSubject(task.subject); setActiveTab('focus'); }}
                          className="bg-[#218363] hover:bg-[#8DBB98] hover:text-[#002B2B] text-white p-2 rounded-lg text-xs"
                          title="بدء المذاكرة الآن في وضع التركيز"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. SCHEDULE TAB */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-[#8DBB98]">الجدول التكيفي الأسبوعي</h2>
                <p className="text-xs text-emerald-200 mt-1">جدول متوازن ديناميكياً يراعي الساعات المخصصة لكل مادة</p>
              </div>
              <button 
                onClick={generateDynamicSchedule}
                className="bg-[#218363] hover:bg-[#8DBB98] hover:text-[#002B2B] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> إعادة توليد الجدول تلقائياً
              </button>
            </div>

            <div className="bg-[#0B5753] p-6 rounded-2xl border border-[#218363] space-y-4">
              {scheduleTasks.map((task) => (
                <div key={task.id} className="bg-[#002B2B] p-4 rounded-xl border border-[#218363] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-10 rounded-full" style={{ backgroundColor: task.subjectColor || '#218363' }}></div>
                    <div>
                      <span className="text-xs font-bold text-[#8DBB98]">{task.day}</span>
                      <h3 className="text-lg font-bold text-white">{task.subject}</h3>
                      <p className="text-xs text-emerald-200">{task.type} ({task.duration})</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-[#0B5753] px-3 py-1.5 rounded-lg text-emerald-100 border border-[#218363]">{task.time}</span>
                    <button 
                      onClick={() => toggleTaskComplete(task.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold ${
                        task.completed ? 'bg-emerald-800 text-emerald-200' : 'bg-[#218363] text-white'
                      }`}
                    >
                      {task.completed ? 'مكتمل ✅' : 'تعليم كمكتمل'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. FOCUS & POMODORO TAB */}
        {activeTab === 'focus' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#8DBB98]">وضع التركيز بومودورو 🧠</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pomodoro Timer Box */}
              <div className="md:col-span-2 bg-[#0B5753] p-8 rounded-2xl border border-[#218363] flex flex-col items-center justify-center text-center">
                <span className="text-xs bg-[#002B2B] px-4 py-1 rounded-full text-[#8DBB98] border border-[#218363] mb-4">
                  جاري مذاكرة: <strong className="text-white">{activeTaskSubject}</strong>
                </span>

                <div className="text-6xl md:text-7xl font-bold text-white my-6 tracking-wider font-mono bg-[#002B2B] px-8 py-6 rounded-3xl border border-[#218363]">
                  {formatTime(pomodoroTime)}
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="bg-[#218363] hover:bg-[#8DBB98] hover:text-[#002B2B] text-white px-8 py-3 rounded-xl font-bold text-base transition-all flex items-center gap-2 shadow-lg"
                  >
                    {isTimerRunning ? <><Pause className="w-5 h-5" /> إيقاف مؤقت</> : <><Play className="w-5 h-5" /> بدء التركيز</>}
                  </button>
                  <button 
                    onClick={() => { setIsTimerRunning(false); setPomodoroTime(25 * 60); }}
                    className="bg-[#002B2B] hover:bg-[#218363] text-emerald-200 px-4 py-3 rounded-xl transition-all"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Distraction Logger */}
              <div className="bg-[#0B5753] p-6 rounded-2xl border border-[#218363] flex flex-col">
                <h3 className="text-base font-bold text-[#8DBB98] mb-2 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-yellow-400" />
                  <span>سجل تفريغ التشتت اليدوي</span>
                </h3>
                <p className="text-xs text-emerald-200 mb-4">اكتب أي فكرة تشتتك هنا لإفراغ ذهنك والعودة فوراً للمذاكرة.</p>

                <form onSubmit={handleAddDistraction} className="flex gap-2 mb-4">
                  <input 
                    type="text" 
                    placeholder="ما الذي يشغلك الآن؟..." 
                    value={newDistractionText}
                    onChange={(e) => setNewDistractionText(e.target.value)}
                    className="flex-1 bg-[#002B2B] p-2 rounded-xl text-xs text-white border border-[#218363] focus:outline-none"
                  />
                  <button type="submit" className="bg-[#218363] px-3 py-2 rounded-xl text-xs font-bold text-white">تفريغ</button>
                </form>

                <div className="flex-1 overflow-y-auto space-y-2 max-h-48 pr-1">
                  {distractions.length === 0 ? (
                    <p className="text-xs text-emerald-300 text-center py-4">لا يوجد أفكار تشتت مسجلة، استمر بالتركيز!</p>
                  ) : (
                    distractions.map((d) => (
                      <div key={d.id} className="bg-[#002B2B] p-2.5 rounded-lg border border-[#218363]/40 text-xs">
                        <span className="text-emerald-300 block text-[10px]">{d.time}</span>
                        <span className="text-white">{d.text}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. SUBJECTS & EXAMS TAB */}
        {activeTab === 'subjects' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#8DBB98]">إدارة المواد والامتحانات</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Subjects List */}
              <div className="bg-[#0B5753] p-6 rounded-2xl border border-[#218363] space-y-4">
                <h3 className="text-lg font-bold text-white">المواد الدراسية المسجلة</h3>
                <div className="space-y-3">
                  {subjects.map((s) => (
                    <div key={s.id} className="bg-[#002B2B] p-4 rounded-xl border border-[#218363] flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{s.icon}</span>
                        <div>
                          <h4 className="font-bold text-white">{s.name}</h4>
                          <p className="text-xs text-emerald-200">مستوى الصعوبة: {s.difficulty === 'hard' ? 'عالية' : 'متوسطة'}</p>
                        </div>
                      </div>
                      <span className="text-xs bg-[#0B5753] px-3 py-1 rounded-full text-[#8DBB98]">{s.weeklyHours} ساعات/أسبوع</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Exams List */}
              <div className="bg-[#0B5753] p-6 rounded-2xl border border-[#218363] space-y-4">
                <h3 className="text-lg font-bold text-white">مواعيد الامتحانات القادمة</h3>
                <div className="space-y-3">
                  {exams.map((ex) => (
                    <div key={ex.id} className="bg-[#002B2B] p-4 rounded-xl border border-[#218363] flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-white">{ex.subject}</h4>
                        <p className="text-xs text-emerald-200">{ex.title}</p>
                      </div>
                      <span className="text-xs bg-red-900/60 text-red-200 border border-red-700 px-3 py-1 rounded-lg">
                        {ex.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. BUSY TIMES TAB */}
        {activeTab === 'busy' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#8DBB98]">أوقات الانشغال والالتزامات الثابتة</h2>
            <div className="bg-[#0B5753] p-6 rounded-2xl border border-[#218363] space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {busyTimes.map((b) => (
                  <div key={b.id} className="bg-[#002B2B] p-4 rounded-xl border border-[#218363] flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-[#8DBB98]" />
                      <span className="font-bold text-white">{b.title}</span>
                    </div>
                    <span className="text-xs text-emerald-200 bg-[#0B5753] px-3 py-1 rounded-lg">
                      من {b.startTime} إلى {b.endTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#8DBB98]">إعدادات الحساب والمرحلة</h2>
            <div className="bg-[#0B5753] p-6 rounded-2xl border border-[#218363] space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-[#218363]">
                <div>
                  <p className="font-bold text-white">إعادة تشغيل معالج الإعداد (Onboarding Wizard)</p>
                  <p className="text-xs text-emerald-200">تغيير مرحلتك الدراسية أو تفضيلاتك من البداية</p>
                </div>
                <button 
                  onClick={() => { setOnboardingStep(1); setIsOnboardingComplete(false); }}
                  className="bg-[#218363] hover:bg-[#8DBB98] hover:text-[#002B2B] text-white px-4 py-2 rounded-xl text-xs font-bold"
                >
                  تشغيل المعالج الآن
                </button>
              </div>

              <div>
                <p className="font-bold text-white mb-1">البريد الإلكتروني المسجل</p>
                <p className="text-sm text-emerald-200">{currentUser.email}</p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}