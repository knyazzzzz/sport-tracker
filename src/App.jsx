import { useState, useEffect, useRef } from "react";

// ── i18n ──────────────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    name:"English", flag:"🇬🇧",
    appName:"Chainly",
    today:"Today", yesterday:"Yesterday",
    checkin:"Check-in", stats:"Stats", habits:"Habits", share:"Share", settings:"Settings",
    todayHabits:"Today's Habits",
    noHabitsYet:"No habits yet — add some in the Habits tab!",
    streak:"Streak", active:"Active", week:"Week",
    restDay:"Rest Day", restDayDone:"✓ Rest Day",
    streakFreeze:"🧊 Freeze", freezeUsed:"🧊 Used",
    freezeRefillIn:(d)=>`Refills in ${d}d`,
    freezeOnceMonth:"Once per month",
    forgotYesterday:"Forgot yesterday?",
    forgotYesterdayDesc:"Tap to log yesterday's habits",
    done:"Done!", tap:"Tap",
    weeklyGoal:"Weekly goal", bestStreak:"best",
    overallStreak:"Overall Streak", activeDays:"Active Days",
    completions:"Completions", bestDay:"Best Day",
    longestStreak:"Longest Streak", bestWeek:"Best Week",
    thisWeek:"This Week", tapToView:"tap to view",
    monthlyActiveDays:"Monthly Active Days",
    habitStreaks:"Habit Streaks", heatmap:"Heatmap", tapCell:"tap cell",
    less:"Less", more:"More", rest:"Rest",
    myHabits:"My Habits", swipeToDelete:"💡 Swipe left to delete",
    newHabitPlaceholder:"New habit name...",
    add:"Add", edit:"Edit",
    streakReminders:"🔔 Streak Reminders",
    notifDesc:"Get notified at 8 PM if your streak is at risk.",
    notifEnabled:"✓ Notifications enabled", enableNotif:"Enable Notifications",
    shareProgress:"Share Your Progress",
    shareDesc:"Generate a stats card and send it to friends!",
    generateCard:"✨ Generate Stats Card",
    download:"⬇️ Download", copy:"📋 Copy",
    noGoal:"No goal", daysPerWeek:"Days/week", perWeek:"×/week", thisWeekCount:"this week",
    viewOnly:"View only", yesterdayLog:"Yesterday — you can still log this!",
    markRestDay:"😴 Mark as Rest Day", restProtected:"✓ Rest Day (streak protected)",
    restDayNotApplicable:"Rest days apply to Sport habits only",
    addNote:"Add a note...", editHabit:"Edit Habit",
    icon:"Icon", color:"Color", cancel:"Cancel", save:"Save", deleteHabit:"Delete",
    deleteConfirmTitle:(n)=>`Delete "${n}"?`,
    deleteConfirmBody:"This will permanently delete this habit and all its history. This cannot be undone.",
    milestoneBang:(n)=>`${n}-Day Milestone!`, milestoneStreak:"streak", nice:"🎉 Nice!",
    weeklyReview:"Weekly Review", continue:"Continue ⛓️",
    category:"Category",
    catSport:"Sport", catMind:"Mind", catHealth:"Health", catOther:"Other",
    catSportDesc:"Running, gym, cycling…",
    catMindDesc:"Reading, meditation…",
    catHealthDesc:"Water, sleep, nutrition…",
    catOtherDesc:"Any other habit",
    appearance:"Appearance", language:"Language", theme:"Theme", notifications:"Notifications",
    settingsTitle:"Settings",
    next:"Next →", letsGo:"Let's go! 🚀", back:"Back",
    onboarding:[
      {emoji:"⛓️",title:"Welcome to Chainly",body:"Build daily habits, track streaks, and stay consistent. Works for sport, sleep, reading — anything you want to do every day."},
      {emoji:"✅",title:"Daily Check-in",body:"Every day, tap your habits to mark them done. Takes just 10 seconds, morning or evening."},
      {emoji:"🏷️",title:"Habit Categories",body:"Assign a category when creating a habit — Sport, Mind, Health, or Other. Sport habits support Rest Days to protect your streak on recovery days."},
      {emoji:"🔥",title:"Streaks & Protection",body:"Build streaks by completing habits daily. Use Rest Days (Sport only) or your monthly Streak Freeze to protect your chain when life gets in the way."},
      {emoji:"🏆",title:"Milestones & Goals",body:"Set weekly targets per habit, earn milestone badges at 7, 30, 100+ days, and share your stats card with friends."},
    ],
    weeklyReviewMsg:["Keep showing up! 💪","Solid week, keep the chain going! ⛓️","Great consistency this week! 🔥","Outstanding week! You're on fire! 🚀","Perfect week! Absolutely crushing it! 🏆"],
    shareText:(s,t,w)=>`⛓️ ${s} day streak on Chainly! ${t} active days 💪 #Chainly #HabitTracker`,
    shareWa:(s,t,w)=>`⛓️ Chainly Stats\n🔥 ${s}d streak\n📅 ${t} active days\n📊 ${w}/7 this week`,
    madeWith:"Made with Chainly ⛓️", habitStreaksCard:"Habit Streaks", last4weeks:"Last 4 Weeks",
    copied:"Copied!", copyFail:"Please download instead.", days:(n)=>`${n}d`,
  },
  es: {
    name:"Español", flag:"🇪🇸",
    appName:"Chainly",
    today:"Hoy", yesterday:"Ayer",
    checkin:"Registro", stats:"Estadísticas", habits:"Hábitos", share:"Compartir", settings:"Ajustes",
    todayHabits:"Hábitos de hoy",
    noHabitsYet:"Aún no hay hábitos — ¡añade algunos en la pestaña Hábitos!",
    streak:"Racha", active:"Días activos", week:"Semana",
    restDay:"Día de descanso", restDayDone:"✓ Descanso",
    streakFreeze:"🧊 Congelar", freezeUsed:"🧊 Usada",
    freezeRefillIn:(d)=>`Se renueva en ${d}d`,
    freezeOnceMonth:"Una vez al mes",
    forgotYesterday:"¿Olvidaste ayer?",
    forgotYesterdayDesc:"Toca para registrar los hábitos de ayer",
    done:"¡Hecho!", tap:"Toca",
    weeklyGoal:"Meta semanal", bestStreak:"mejor",
    overallStreak:"Racha actual", activeDays:"Días activos",
    completions:"Logros", bestDay:"Mejor día",
    longestStreak:"Racha más larga", bestWeek:"Mejor semana",
    thisWeek:"Esta semana", tapToView:"toca para ver",
    monthlyActiveDays:"Días activos por mes",
    habitStreaks:"Rachas", heatmap:"Mapa de actividad", tapCell:"toca para ver",
    less:"Menos", more:"Más", rest:"Descanso",
    myHabits:"Mis hábitos", swipeToDelete:"💡 Desliza a la izquierda para eliminar",
    newHabitPlaceholder:"Nombre del nuevo hábito...",
    add:"Añadir", edit:"Editar",
    streakReminders:"🔔 Recordatorios",
    notifDesc:"Recibirás un aviso a las 20:00 si tu racha está en peligro.",
    notifEnabled:"✓ Notificaciones activadas", enableNotif:"Activar notificaciones",
    shareProgress:"Comparte tu progreso",
    shareDesc:"¡Genera una tarjeta de estadísticas y envíala a tus amigos!",
    generateCard:"✨ Generar tarjeta",
    download:"⬇️ Descargar", copy:"📋 Copiar",
    noGoal:"Sin meta", daysPerWeek:"Días/semana", perWeek:"×/sem", thisWeekCount:"esta semana",
    viewOnly:"Solo lectura", yesterdayLog:"Ayer — ¡aún puedes registrarlo!",
    markRestDay:"😴 Marcar como descanso", restProtected:"✓ Descanso (racha protegida)",
    restDayNotApplicable:"Los días de descanso son solo para hábitos de tipo Deporte",
    addNote:"Añade una nota...", editHabit:"Editar hábito",
    icon:"Icono", color:"Color", cancel:"Cancelar", save:"Guardar", deleteHabit:"Eliminar",
    deleteConfirmTitle:(n)=>`¿Eliminar "${n}"?`,
    deleteConfirmBody:"Esto eliminará permanentemente este hábito y todo su historial. Esta acción no se puede deshacer.",
    milestoneBang:(n)=>`¡Hito de ${n} días!`, milestoneStreak:"racha", nice:"🎉 ¡Genial!",
    weeklyReview:"Resumen semanal", continue:"Continuar ⛓️",
    category:"Categoría",
    catSport:"Deporte", catMind:"Mente", catHealth:"Salud", catOther:"Otro",
    catSportDesc:"Correr, gimnasio, ciclismo…",
    catMindDesc:"Lectura, meditación…",
    catHealthDesc:"Agua, sueño, nutrición…",
    catOtherDesc:"Cualquier otro hábito",
    appearance:"Apariencia", language:"Idioma", theme:"Tema", notifications:"Notificaciones",
    settingsTitle:"Ajustes",
    next:"Siguiente →", letsGo:"¡Vamos! 🚀", back:"Atrás",
    onboarding:[
      {emoji:"⛓️",title:"Bienvenido a Chainly",body:"Construye hábitos diarios, sigue tus rachas y mantén la constancia. Para deporte, sueño, lectura — lo que quieras hacer cada día."},
      {emoji:"✅",title:"Registro diario",body:"Cada día, toca tus hábitos para marcarlos como completados. Solo 10 segundos por la mañana o por la noche."},
      {emoji:"🏷️",title:"Categorías de hábitos",body:"Al crear un hábito, elige su categoría: Deporte, Mente, Salud u Otro. Los hábitos de Deporte admiten Días de descanso para proteger tu racha en días de recuperación."},
      {emoji:"🔥",title:"Rachas y protección",body:"Completa hábitos cada día para construir rachas. Usa los Días de descanso (solo Deporte) o la Congelación mensual para proteger tu cadena cuando la vida lo complica."},
      {emoji:"🏆",title:"Hitos y metas",body:"Fija objetivos semanales por hábito, consigue insignias a los 7, 30, 100+ días y comparte tu tarjeta de estadísticas con amigos."},
    ],
    weeklyReviewMsg:["¡Sigue apareciendo! 💪","¡Buena semana, mantén la cadena! ⛓️","¡Gran constancia esta semana! 🔥","¡Semana sobresaliente, estás en racha! 🚀","¡Semana perfecta, lo estás dando todo! 🏆"],
    shareText:(s,t,w)=>`⛓️ ¡${s} días de racha en Chainly! ${t} días activos 💪 #Chainly`,
    shareWa:(s,t,w)=>`⛓️ Chainly\n🔥 Racha de ${s}d\n📅 ${t} días activos\n📊 ${w}/7 esta semana`,
    madeWith:"Hecho con Chainly ⛓️", habitStreaksCard:"Rachas", last4weeks:"Últimas 4 semanas",
    copied:"¡Copiado!", copyFail:"Por favor, descarga la imagen.", days:(n)=>`${n}d`,
  },
  zh: {
    name:"中文", flag:"🇨🇳",
    appName:"Chainly",
    today:"今天", yesterday:"昨天",
    checkin:"打卡", stats:"统计", habits:"习惯", share:"分享", settings:"设置",
    todayHabits:"今日习惯",
    noHabitsYet:"还没有习惯 — 在「习惯」标签页添加吧！",
    streak:"连续", active:"活跃天", week:"本周",
    restDay:"休息日", restDayDone:"✓ 休息日",
    streakFreeze:"🧊 保护", freezeUsed:"🧊 已用",
    freezeRefillIn:(d)=>`${d}天后刷新`,
    freezeOnceMonth:"每月一次",
    forgotYesterday:"昨天忘记打卡了？",
    forgotYesterdayDesc:"点击补录昨天的习惯",
    done:"已完成！", tap:"点击",
    weeklyGoal:"每周目标", bestStreak:"最长",
    overallStreak:"当前连续", activeDays:"活跃天数",
    completions:"完成次数", bestDay:"最佳日",
    longestStreak:"最长连续", bestWeek:"最佳周",
    thisWeek:"本周", tapToView:"点击查看",
    monthlyActiveDays:"每月活跃天数",
    habitStreaks:"习惯连续", heatmap:"热力图", tapCell:"点击查看",
    less:"少", more:"多", rest:"休息",
    myHabits:"我的习惯", swipeToDelete:"💡 向左滑动删除",
    newHabitPlaceholder:"输入新习惯名称…",
    add:"添加", edit:"编辑",
    streakReminders:"🔔 连续提醒",
    notifDesc:"若当天尚未打卡且有连续记录，晚上8点将收到提醒。",
    notifEnabled:"✓ 通知已开启", enableNotif:"开启通知",
    shareProgress:"分享你的进度",
    shareDesc:"生成统计卡片，发送给朋友！",
    generateCard:"✨ 生成统计卡片",
    download:"⬇️ 下载", copy:"📋 复制",
    noGoal:"不设目标", daysPerWeek:"次/周", perWeek:"次/周", thisWeekCount:"本周",
    viewOnly:"仅查看", yesterdayLog:"昨天 — 现在还可以补录！",
    markRestDay:"😴 标记为休息日", restProtected:"✓ 休息日（连续受保护）",
    restDayNotApplicable:"休息日仅适用于运动类习惯",
    addNote:"添加备注…", editHabit:"编辑习惯",
    icon:"图标", color:"颜色", cancel:"取消", save:"保存", deleteHabit:"删除",
    deleteConfirmTitle:(n)=>`删除「${n}」？`,
    deleteConfirmBody:"这将永久删除该习惯及其所有历史记录，且无法恢复。",
    milestoneBang:(n)=>`${n}天里程碑！`, milestoneStreak:"连续", nice:"🎉 太棒了！",
    weeklyReview:"每周回顾", continue:"继续 ⛓️",
    category:"类别",
    catSport:"运动", catMind:"思维", catHealth:"健康", catOther:"其他",
    catSportDesc:"跑步、健身、骑行…",
    catMindDesc:"阅读、冥想…",
    catHealthDesc:"喝水、睡眠、饮食…",
    catOtherDesc:"任何其他习惯",
    appearance:"外观", language:"语言", theme:"主题", notifications:"通知",
    settingsTitle:"设置",
    next:"下一步 →", letsGo:"开始吧！🚀", back:"返回",
    onboarding:[
      {emoji:"⛓️",title:"欢迎使用 Chainly",body:"建立每日习惯，追踪连续记录，保持自律。运动、睡眠、阅读，任何你想每天坚持的事都适用。"},
      {emoji:"✅",title:"每日打卡",body:"每天点击习惯即可标记完成。早晨或睡前只需10秒钟。"},
      {emoji:"🏷️",title:"习惯分类",body:"创建习惯时选择类别：运动、思维、健康或其他。运动类习惯支持休息日，让恢复日不影响你的连续记录。"},
      {emoji:"🔥",title:"连续记录与保护",body:"每天完成习惯以积累连续天数。善用休息日（仅限运动类）或每月连续保护，让意外不打断你的链条。"},
      {emoji:"🏆",title:"里程碑与目标",body:"为每个习惯设置每周目标，达成7天、30天、100天里程碑解锁徽章，并与朋友分享你的统计卡片。"},
    ],
    weeklyReviewMsg:["继续坚持！💪","不错的一周，保持连续！⛓️","本周表现很稳定！🔥","出色的一周，你状态火热！🚀","完美的一周，你太厉害了！🏆"],
    shareText:(s,t,w)=>`⛓️ 在 Chainly 上连续 ${s} 天！活跃 ${t} 天 💪 #Chainly`,
    shareWa:(s,t,w)=>`⛓️ Chainly\n🔥 连续 ${s} 天\n📅 活跃 ${t} 天\n📊 本周 ${w}/7`,
    madeWith:"由 Chainly ⛓️ 制作", habitStreaksCard:"习惯连续", last4weeks:"近4周",
    copied:"已复制！", copyFail:"请下载图片。", days:(n)=>`${n}天`,
  },
  ar: {
    name:"العربية", flag:"🇸🇦",
    appName:"Chainly",
    today:"اليوم", yesterday:"أمس",
    checkin:"تسجيل", stats:"إحصائيات", habits:"العادات", share:"مشاركة", settings:"الإعدادات",
    todayHabits:"عادات اليوم",
    noHabitsYet:"لا توجد عادات بعد — أضف بعضها من تبويب العادات!",
    streak:"السلسلة", active:"أيام نشطة", week:"الأسبوع",
    restDay:"يوم راحة", restDayDone:"✓ راحة",
    streakFreeze:"🧊 تجميد", freezeUsed:"🧊 مُستخدَم",
    freezeRefillIn:(d)=>`يُجدَّد بعد ${d} أيام`,
    freezeOnceMonth:"مرة واحدة شهرياً",
    forgotYesterday:"نسيت أمس؟",
    forgotYesterdayDesc:"اضغط لتسجيل عادات أمس",
    done:"تم!", tap:"اضغط",
    weeklyGoal:"الهدف الأسبوعي", bestStreak:"الأفضل",
    overallStreak:"السلسلة الحالية", activeDays:"الأيام النشطة",
    completions:"مرات الإنجاز", bestDay:"أفضل يوم",
    longestStreak:"أطول سلسلة", bestWeek:"أفضل أسبوع",
    thisWeek:"هذا الأسبوع", tapToView:"اضغط للعرض",
    monthlyActiveDays:"الأيام النشطة شهرياً",
    habitStreaks:"سلاسل العادات", heatmap:"خريطة النشاط", tapCell:"اضغط للعرض",
    less:"أقل", more:"أكثر", rest:"راحة",
    myHabits:"عاداتي", swipeToDelete:"💡 اسحب يساراً للحذف",
    newHabitPlaceholder:"اسم العادة الجديدة...",
    add:"إضافة", edit:"تعديل",
    streakReminders:"🔔 تذكيرات السلسلة",
    notifDesc:"ستصلك إشعار الساعة 8 مساءً إذا كانت سلسلتك في خطر.",
    notifEnabled:"✓ الإشعارات مفعّلة", enableNotif:"تفعيل الإشعارات",
    shareProgress:"شارك تقدّمك",
    shareDesc:"أنشئ بطاقة إحصائيات وأرسلها لأصدقائك!",
    generateCard:"✨ إنشاء البطاقة",
    download:"⬇️ تنزيل", copy:"📋 نسخ",
    noGoal:"بدون هدف", daysPerWeek:"أيام/أسبوع", perWeek:"×/أسبوع", thisWeekCount:"هذا الأسبوع",
    viewOnly:"للعرض فقط", yesterdayLog:"أمس — لا يزال بإمكانك التسجيل!",
    markRestDay:"😴 تحديد كيوم راحة", restProtected:"✓ يوم راحة (السلسلة محمية)",
    restDayNotApplicable:"أيام الراحة مخصصة لعادات الرياضة فقط",
    addNote:"أضف ملاحظة...", editHabit:"تعديل العادة",
    icon:"الأيقونة", color:"اللون", cancel:"إلغاء", save:"حفظ", deleteHabit:"حذف",
    deleteConfirmTitle:(n)=>`حذف "${n}"؟`,
    deleteConfirmBody:"سيؤدي هذا إلى حذف هذه العادة وكامل سجلّها بشكل دائم.",
    milestoneBang:(n)=>`إنجاز ${n} يوم!`, milestoneStreak:"سلسلة", nice:"🎉 رائع!",
    weeklyReview:"المراجعة الأسبوعية", continue:"متابعة ⛓️",
    category:"الفئة",
    catSport:"رياضة", catMind:"ذهن", catHealth:"صحة", catOther:"أخرى",
    catSportDesc:"جري، رياضة، ركوب دراجة…",
    catMindDesc:"قراءة، تأمل…",
    catHealthDesc:"ماء، نوم، تغذية…",
    catOtherDesc:"أي عادة أخرى",
    appearance:"المظهر", language:"اللغة", theme:"السمة", notifications:"الإشعارات",
    settingsTitle:"الإعدادات",
    next:"التالي →", letsGo:"هيّا نبدأ! 🚀", back:"رجوع",
    onboarding:[
      {emoji:"⛓️",title:"مرحباً بك في Chainly",body:"كوّن عادات يومية، تابع سلاسلك، وحافظ على انتظامك. للرياضة، النوم، القراءة — أي شيء تريد فعله كل يوم."},
      {emoji:"✅",title:"التسجيل اليومي",body:"كل يوم، اضغط على عاداتك لتسجيلها كمنجزة. عشر ثوانٍ في الصباح أو المساء تكفي."},
      {emoji:"🏷️",title:"تصنيف العادات",body:"عند إنشاء عادة، اختر فئتها: رياضة، ذهن، صحة، أو أخرى. عادات الرياضة تدعم أيام الراحة لحماية سلسلتك أثناء التعافي."},
      {emoji:"🔥",title:"السلاسل والحماية",body:"أكمل عاداتك يومياً لبناء سلاسل متواصلة. استخدم أيام الراحة (للرياضة فقط) أو التجميد الشهري لحماية سلسلتك عند الحاجة."},
      {emoji:"🏆",title:"الإنجازات والأهداف",body:"حدد أهدافاً أسبوعية لكل عادة، واحصل على شارات عند 7 و30 و100+ يوم، وشارك بطاقة إحصائياتك مع الأصدقاء."},
    ],
    weeklyReviewMsg:["استمر في الحضور! 💪","أسبوع جيد، واصل السلسلة! ⛓️","ثبات رائع هذا الأسبوع! 🔥","أسبوع متميز، أنت في حالة ممتازة! 🚀","أسبوع مثالي، أنت تتفوق على نفسك! 🏆"],
    shareText:(s,t,w)=>`⛓️ ${s} يوم متواصل على Chainly! ${t} يوم نشط 💪 #Chainly`,
    shareWa:(s,t,w)=>`⛓️ Chainly\n🔥 سلسلة ${s} يوم\n📅 ${t} يوم نشط\n📊 ${w}/7 هذا الأسبوع`,
    madeWith:"صُنع بواسطة Chainly ⛓️", habitStreaksCard:"سلاسل العادات", last4weeks:"آخر 4 أسابيع",
    copied:"تم النسخ!", copyFail:"يرجى التنزيل بدلاً من ذلك.", days:(n)=>`${n}ي`,
  },
  pt: {
    name:"Português", flag:"🇧🇷",
    appName:"Chainly",
    today:"Hoje", yesterday:"Ontem",
    checkin:"Registro", stats:"Estatísticas", habits:"Hábitos", share:"Compartilhar", settings:"Configurações",
    todayHabits:"Hábitos de hoje",
    noHabitsYet:"Nenhum hábito ainda — adicione alguns na aba Hábitos!",
    streak:"Sequência", active:"Dias ativos", week:"Semana",
    restDay:"Dia de descanso", restDayDone:"✓ Descanso",
    streakFreeze:"🧊 Congelar", freezeUsed:"🧊 Usado",
    freezeRefillIn:(d)=>`Renova em ${d}d`,
    freezeOnceMonth:"Uma vez por mês",
    forgotYesterday:"Esqueceu ontem?",
    forgotYesterdayDesc:"Toque para registrar os hábitos de ontem",
    done:"Feito!", tap:"Toque",
    weeklyGoal:"Meta semanal", bestStreak:"melhor",
    overallStreak:"Sequência atual", activeDays:"Dias ativos",
    completions:"Conclusões", bestDay:"Melhor dia",
    longestStreak:"Maior sequência", bestWeek:"Melhor semana",
    thisWeek:"Esta semana", tapToView:"toque para ver",
    monthlyActiveDays:"Dias ativos por mês",
    habitStreaks:"Sequências", heatmap:"Mapa de atividade", tapCell:"toque para ver",
    less:"Menos", more:"Mais", rest:"Descanso",
    myHabits:"Meus hábitos", swipeToDelete:"💡 Deslize para a esquerda para excluir",
    newHabitPlaceholder:"Nome do novo hábito...",
    add:"Adicionar", edit:"Editar",
    streakReminders:"🔔 Lembretes",
    notifDesc:"Receba uma notificação às 20h se sua sequência estiver em risco.",
    notifEnabled:"✓ Notificações ativadas", enableNotif:"Ativar notificações",
    shareProgress:"Compartilhe seu progresso",
    shareDesc:"Gere um cartão de estatísticas e envie para seus amigos!",
    generateCard:"✨ Gerar cartão",
    download:"⬇️ Baixar", copy:"📋 Copiar",
    noGoal:"Sem meta", daysPerWeek:"Dias/semana", perWeek:"×/sem", thisWeekCount:"esta semana",
    viewOnly:"Somente leitura", yesterdayLog:"Ontem — você ainda pode registrar!",
    markRestDay:"😴 Marcar como descanso", restProtected:"✓ Descanso (sequência protegida)",
    restDayNotApplicable:"Dias de descanso são apenas para hábitos de Esporte",
    addNote:"Adicione uma nota...", editHabit:"Editar hábito",
    icon:"Ícone", color:"Cor", cancel:"Cancelar", save:"Salvar", deleteHabit:"Excluir",
    deleteConfirmTitle:(n)=>`Excluir "${n}"?`,
    deleteConfirmBody:"Isso removerá permanentemente este hábito e todo o seu histórico. Essa ação não pode ser desfeita.",
    milestoneBang:(n)=>`Marco de ${n} dias!`, milestoneStreak:"sequência", nice:"🎉 Incrível!",
    weeklyReview:"Revisão semanal", continue:"Continuar ⛓️",
    category:"Categoria",
    catSport:"Esporte", catMind:"Mente", catHealth:"Saúde", catOther:"Outro",
    catSportDesc:"Corrida, academia, ciclismo…",
    catMindDesc:"Leitura, meditação…",
    catHealthDesc:"Água, sono, nutrição…",
    catOtherDesc:"Qualquer outro hábito",
    appearance:"Aparência", language:"Idioma", theme:"Tema", notifications:"Notificações",
    settingsTitle:"Configurações",
    next:"Próximo →", letsGo:"Vamos lá! 🚀", back:"Voltar",
    onboarding:[
      {emoji:"⛓️",title:"Bem-vindo ao Chainly",body:"Construa hábitos diários, acompanhe sequências e mantenha a consistência. Para esporte, sono, leitura — qualquer coisa que queira fazer todo dia."},
      {emoji:"✅",title:"Registro diário",body:"Todo dia, toque nos seus hábitos para marcá-los como concluídos. Leva apenas 10 segundos, de manhã ou à noite."},
      {emoji:"🏷️",title:"Categorias de hábitos",body:"Ao criar um hábito, escolha sua categoria: Esporte, Mente, Saúde ou Outro. Hábitos de Esporte suportam Dias de descanso para proteger sua sequência nos dias de recuperação."},
      {emoji:"🔥",title:"Sequências e proteção",body:"Complete hábitos diariamente para construir sequências. Use Dias de descanso (Esporte) ou o Congelamento mensal para proteger sua corrente quando a vida complicar."},
      {emoji:"🏆",title:"Marcos e metas",body:"Defina metas semanais por hábito, conquiste medalhas aos 7, 30, 100+ dias e compartilhe seu cartão de estatísticas com amigos."},
    ],
    weeklyReviewMsg:["Continue aparecendo! 💪","Boa semana, mantenha a corrente! ⛓️","Ótima consistência essa semana! 🔥","Semana excepcional, você está pegando fogo! 🚀","Semana perfeita, você está arrasando! 🏆"],
    shareText:(s,t,w)=>`⛓️ ${s} dias seguidos no Chainly! ${t} dias ativos 💪 #Chainly`,
    shareWa:(s,t,w)=>`⛓️ Chainly\n🔥 ${s}d sequência\n📅 ${t} dias ativos\n📊 ${w}/7 esta semana`,
    madeWith:"Feito com Chainly ⛓️", habitStreaksCard:"Sequências", last4weeks:"Últimas 4 semanas",
    copied:"Copiado!", copyFail:"Por favor, faça o download.", days:(n)=>`${n}d`,
  },
};

const CATEGORIES = ["sport","mind","health","other"];
const CAT_ICONS = { sport:"🏃", mind:"🧠", health:"💧", other:"⭐" };

const PALETTES = {
  green:  {name:"Forest", a1:"#10b981",a2:"#34d399",bg0:"#0a1a12",bg1:"#0d1f17",bg2:"#0f2a1e",card:"rgba(255,255,255,0.04)",border:"rgba(16,185,129,0.15)",muted:"#3a5a48",sub:"#668a76"},
  indigo: {name:"Indigo", a1:"#6366f1",a2:"#818cf8",bg0:"#0d0d1f",bg1:"#111128",bg2:"#161630",card:"rgba(255,255,255,0.04)",border:"rgba(99,102,241,0.15)",muted:"#3a3a6a",sub:"#6666aa"},
  rose:   {name:"Rose",   a1:"#f43f5e",a2:"#fb7185",bg0:"#1a0a0e",bg1:"#200d12",bg2:"#2a1018",card:"rgba(255,255,255,0.04)",border:"rgba(244,63,94,0.15)",muted:"#5a2a35",sub:"#8a5560"},
  amber:  {name:"Amber",  a1:"#f59e0b",a2:"#fbbf24",bg0:"#1a1400",bg1:"#1f1800",bg2:"#2a2000",card:"rgba(255,255,255,0.04)",border:"rgba(245,158,11,0.15)",muted:"#5a4800",sub:"#8a7020"},
  light:  {name:"Light",  a1:"#10b981",a2:"#059669",bg0:"#f0faf5",bg1:"#e8f5ef",bg2:"#d8efe8",card:"rgba(0,0,0,0.04)",border:"rgba(16,185,129,0.2)",muted:"#6aaa88",sub:"#4a8a68",text:"#111"},
};
const ACT_COLORS = ["#10b981","#f59e0b","#6366f1","#ef4444","#3b82f6","#ec4899","#8b5cf6","#14b8a6","#f97316","#84cc16"];
const ACT_ICONS  = ["🏃","🚴","🏊","💪","🧘","📚","💧","😴","🥗","🎯","🧠","🚶","⚽","🎸","✍️","🌿"];
const DAYS_EN = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MILESTONES = [7,14,30,60,100,200,365];

function toKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function today(){return toKey(new Date());}
function yesterday(){const d=new Date();d.setDate(d.getDate()-1);return toKey(d);}
function daysAgo(n){const d=new Date();d.setDate(d.getDate()-n);return d;}
function lsGet(k,fb){try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb;}catch{return fb;}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}
function haptic(tp="light"){try{if(navigator.vibrate)navigator.vibrate(tp==="heavy"?[30,10,30]:tp==="medium"?20:10);}catch{}}
function hexToRgb(h){return `${parseInt(h.slice(1,3),16)},${parseInt(h.slice(3,5),16)},${parseInt(h.slice(5,7),16)}`;}
function migrateLog(log){const m={};Object.keys(log).forEach(dk=>{m[dk]={};Object.keys(log[dk]).forEach(id=>{const v=log[dk][id];m[dk][id]=(typeof v==="boolean"||v===undefined)?{done:!!v}:v;});});return m;}
function detectLang(){const l=(navigator.language||"en").slice(0,2).toLowerCase();return TRANSLATIONS[l]?l:"en";}
function daysUntilNextMonth(){const n=new Date(),nm=new Date(n.getFullYear(),n.getMonth()+1,1);return Math.ceil((nm-n)/86400000);}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({pal}){
  const sh={background:`linear-gradient(90deg,${pal.card} 25%,${pal.border} 50%,${pal.card} 75%)`,backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite"};
  return(<div style={{minHeight:"100vh",background:pal.bg0,padding:24}}><style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style><div style={{maxWidth:640,margin:"0 auto"}}><div style={{height:28,width:140,borderRadius:8,...sh,marginBottom:8}}/><div style={{height:14,width:180,borderRadius:6,...sh,marginBottom:32}}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:20}}>{[1,2,3].map(i=><div key={i} style={{height:80,borderRadius:16,...sh}}/>)}</div>{[1,2,3].map(i=><div key={i} style={{height:64,borderRadius:12,...sh,marginBottom:10}}/>)}</div></div>);
}

// ── SlideModal ────────────────────────────────────────────────────────────────
function SlideModal({onClose,children,pal,fullscreen=false}){
  const [vis,setVis]=useState(false);
  useEffect(()=>{requestAnimationFrame(()=>setVis(true));},[]);
  function close(){setVis(false);setTimeout(onClose,280);}
  return(
    <div onClick={close} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:50,display:"flex",alignItems:"flex-end",justifyContent:"center",opacity:vis?1:0,transition:"opacity 0.28s ease"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:pal.bg1,border:`1px solid ${pal.border}`,borderRadius:"24px 24px 0 0",padding:24,width:"100%",maxWidth:640,maxHeight:fullscreen?"92vh":"82vh",overflowY:"auto",transform:vis?"translateY(0)":"translateY(100%)",transition:"transform 0.28s cubic-bezier(0.32,0.72,0,1)"}}>
        {typeof children==="function"?children(close):children}
      </div>
    </div>
  );
}

// ── Onboarding ────────────────────────────────────────────────────────────────
function Onboarding({onDone,pal,t}){
  const [step,setStep]=useState(0);
  const s=t.onboarding[step],tx=pal.text||"#fff";
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{background:pal.bg1,border:`1px solid ${pal.border}`,borderRadius:24,padding:36,maxWidth:380,width:"100%",textAlign:"center"}}>
        <div style={{fontSize:52,marginBottom:14}}>{s.emoji}</div>
        <div style={{fontSize:19,fontWeight:800,color:tx,marginBottom:10}}>{s.title}</div>
        <div style={{fontSize:14,color:pal.sub,lineHeight:1.65,marginBottom:28}}>{s.body}</div>
        <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:24}}>{t.onboarding.map((_,i)=><div key={i} style={{width:i===step?22:7,height:7,borderRadius:4,background:i===step?pal.a1:pal.muted,transition:"all 0.3s"}}/>)}</div>
        <div style={{display:"flex",gap:10}}>
          {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:"11px",borderRadius:12,background:"transparent",border:`1px solid ${pal.border}`,color:tx,fontWeight:600,cursor:"pointer"}}>{t.back}</button>}
          <button onClick={()=>step<t.onboarding.length-1?setStep(s=>s+1):onDone()} style={{flex:2,padding:"11px",borderRadius:12,background:pal.a1,border:"none",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:15}}>{step<t.onboarding.length-1?t.next:t.letsGo}</button>
        </div>
      </div>
    </div>
  );
}

// ── MilestoneToast ────────────────────────────────────────────────────────────
function MilestoneToast({milestone,actName,onClose,pal,t}){
  useEffect(()=>{haptic("heavy");const tm=setTimeout(onClose,4000);return()=>clearTimeout(tm);},[]);
  return(
    <div style={{position:"fixed",top:24,left:"50%",transform:"translateX(-50%)",zIndex:200,maxWidth:300,width:"88%",background:pal.bg1,border:`2px solid ${pal.a1}`,borderRadius:20,padding:"14px 18px",textAlign:"center",boxShadow:`0 8px 32px ${pal.a1}44`,animation:"toastIn 0.4s cubic-bezier(0.32,0.72,0,1)"}}>
      <style>{`@keyframes toastIn{from{transform:translateX(-50%) translateY(-40px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}`}</style>
      <div style={{fontSize:32,marginBottom:4}}>🏆</div>
      <div style={{fontWeight:800,color:pal.text||"#fff",fontSize:15}}>{t.milestoneBang(milestone)}</div>
      <div style={{color:pal.sub,fontSize:12,marginTop:3}}>{actName} {t.milestoneStreak}</div>
      <button onClick={onClose} style={{marginTop:10,padding:"5px 16px",borderRadius:10,background:pal.a1,border:"none",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13}}>{t.nice}</button>
    </div>
  );
}

// ── WeeklyReview ──────────────────────────────────────────────────────────────
function WeeklyReview({log,activities,streaks,onClose,pal,t}){
  const tx=pal.text||"#fff";
  const last7=Array.from({length:7},(_,i)=>toKey(daysAgo(i)));
  const activeDays=last7.filter(k=>log[k]&&Object.values(log[k]).some(x=>x?.done)).length;
  const totalDone=last7.reduce((s,k)=>s+Object.values(log[k]||{}).filter(x=>x?.done).length,0);
  const msg=t.weeklyReviewMsg[Math.min(Math.floor(activeDays/7*t.weeklyReviewMsg.length),t.weeklyReviewMsg.length-1)];
  return(
    <div style={{color:tx}}>
      <div style={{textAlign:"center",marginBottom:18}}><div style={{fontSize:40,marginBottom:6}}>📋</div><div style={{fontWeight:800,fontSize:19}}>{t.weeklyReview}</div><div style={{color:pal.sub,fontSize:12,marginTop:3}}>{new Date().toLocaleDateString(undefined,{month:"long",day:"numeric"})}</div></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        {[["📅",t.activeDays,`${activeDays}/7`],["💪",t.completions,totalDone],["🔥",t.longestStreak,Math.max(...activities.map(a=>(streaks[a.id]||{}).current||0),0)+"d"],["🎯",t.habits,activities.length]].map(([e,l,v])=>(
          <div key={l} style={{background:pal.card,border:`1px solid ${pal.border}`,borderRadius:14,padding:12,textAlign:"center"}}>
            <div style={{fontSize:20}}>{e}</div><div style={{fontSize:19,fontWeight:800,color:pal.a1}}>{v}</div><div style={{fontSize:10,color:pal.muted,marginTop:1}}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{background:pal.a1+"22",border:`1px solid ${pal.a1}55`,borderRadius:14,padding:14,textAlign:"center",marginBottom:18,color:pal.a1,fontWeight:700,fontSize:14}}>{msg}</div>
      <button onClick={onClose} style={{width:"100%",padding:"12px",borderRadius:12,background:pal.a1,border:"none",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:15}}>{t.continue}</button>
    </div>
  );
}

// ── DayModal ──────────────────────────────────────────────────────────────────
function DayModal({dateKey,activities,log,onClose,onToggle,onNote,onRestDay,pal,t}){
  const entry=log[dateKey]||{};
  const isToday=dateKey===today(),isYesterday=dateKey===yesterday(),canEdit=isToday||isYesterday;
  const d=new Date(dateKey+"T12:00:00");
  const isRest=entry.__rest__?.done;
  const hasSport=activities.some(a=>a.category==="sport");
  const tx=pal.text||"#fff";
  return(
    <SlideModal onClose={onClose} pal={pal} fullscreen>
      {close=>(
        <div style={{color:tx}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
            <div>
              <div style={{fontWeight:800,fontSize:16}}>{d.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"})}</div>
              <div style={{fontSize:12,color:isToday?pal.a1:isYesterday?"#f59e0b":pal.muted,fontWeight:600,marginTop:2}}>{isToday?t.today:isYesterday?t.yesterdayLog:t.viewOnly}</div>
            </div>
            <button onClick={close} style={{background:"transparent",border:"none",color:pal.sub,fontSize:22,cursor:"pointer"}}>✕</button>
          </div>
          {canEdit&&(hasSport
            ?<button onClick={()=>onRestDay(dateKey)} style={{width:"100%",marginBottom:12,padding:"10px",borderRadius:12,background:isRest?pal.a1+"33":"rgba(255,255,255,0.04)",border:`1px solid ${isRest?pal.a1:pal.border}`,color:isRest?pal.a1:pal.sub,fontWeight:700,cursor:"pointer",fontSize:13}}>{isRest?t.restProtected:t.markRestDay}</button>
            :<div style={{marginBottom:12,padding:"9px 14px",borderRadius:12,background:"rgba(255,255,255,0.03)",border:`1px solid ${pal.border}`,fontSize:12,color:pal.muted,textAlign:"center"}}>{t.restDayNotApplicable}</div>
          )}
          {activities.map(a=>{
            const e=entry[a.id]||{};
            return(
              <div key={a.id} style={{marginBottom:12}}>
                <div onClick={()=>canEdit&&onToggle(a.id,dateKey)} style={{display:"flex",alignItems:"center",gap:11,padding:"11px 13px",borderRadius:12,cursor:canEdit?"pointer":"default",background:e.done?a.color+"22":"rgba(255,255,255,0.03)",border:`1px solid ${e.done?a.color+"55":pal.border}`,marginBottom:5}}>
                  <span style={{fontSize:16}}>{a.icon||"⭕"}</span>
                  <div style={{width:20,height:20,borderRadius:"50%",background:e.done?a.color:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>{e.done?"✓":""}</div>
                  <span style={{flex:1,fontWeight:600,fontSize:14,color:e.done?a.color:tx}}>{a.name}</span>
                  <span style={{fontSize:10,color:pal.muted,background:"rgba(255,255,255,0.06)",padding:"2px 7px",borderRadius:8}}>{a.category==="sport"?"🏃":a.category==="mind"?"🧠":a.category==="health"?"💧":"⭐"}</span>
                </div>
                {canEdit&&<textarea value={e.note||""} onChange={ev=>onNote(dateKey,a.id,ev.target.value)} placeholder={t.addNote} style={{width:"100%",padding:"7px 11px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:`1px solid ${pal.border}`,color:tx,fontSize:12,resize:"vertical",minHeight:36,outline:"none",boxSizing:"border-box",fontFamily:"system-ui"}}/>}
              </div>
            );
          })}
        </div>
      )}
    </SlideModal>
  );
}

// ── EditModal ─────────────────────────────────────────────────────────────────
function EditModal({act,onSave,onClose,pal,t}){
  const [name,setName]=useState(act.name);
  const [color,setColor]=useState(act.color);
  const [icon,setIcon]=useState(act.icon||"🏃");
  const [cat,setCat]=useState(act.category||"other");
  const [goalType,setGoalType]=useState(act.goalType||"none");
  const [goalVal,setGoalVal]=useState(act.goalVal||3);
  const tx=pal.text||"#fff";
  const catLabels={sport:t.catSport,mind:t.catMind,health:t.catHealth,other:t.catOther};
  const catEmojis={sport:"🏃",mind:"🧠",health:"💧",other:"⭐"};
  return(
    <SlideModal onClose={onClose} pal={pal}>
      {close=>(
        <div style={{color:tx}}>
          <div style={{fontWeight:800,fontSize:16,marginBottom:18}}>{t.editHabit}</div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,color:pal.sub,display:"block",marginBottom:5}}>{t.habits}</label>
            <input value={name} onChange={e=>setName(e.target.value)} style={{width:"100%",padding:"9px 13px",borderRadius:10,background:"rgba(255,255,255,0.06)",border:`1px solid ${pal.border}`,color:tx,fontSize:14,outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,color:pal.sub,display:"block",marginBottom:6}}>{t.category}</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {CATEGORIES.map(c=>(
                <button key={c} onClick={()=>setCat(c)} style={{padding:"9px 10px",borderRadius:11,border:`1px solid ${cat===c?pal.a1:pal.border}`,background:cat===c?pal.a1+"22":"transparent",color:cat===c?pal.a1:pal.sub,cursor:"pointer",fontWeight:600,fontSize:13,textAlign:"left",display:"flex",alignItems:"center",gap:7}}>
                  <span style={{fontSize:16}}>{catEmojis[c]}</span>
                  <div><div style={{fontSize:12,fontWeight:700}}>{catLabels[c]}</div><div style={{fontSize:10,opacity:0.7}}>{t[`cat${c.charAt(0).toUpperCase()+c.slice(1)}Desc`]}</div></div>
                </button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,color:pal.sub,display:"block",marginBottom:6}}>{t.icon}</label>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{ACT_ICONS.map(ic=><button key={ic} onClick={()=>setIcon(ic)} style={{fontSize:18,padding:"5px 7px",borderRadius:8,border:`2px solid ${ic===icon?pal.a1:"transparent"}`,background:"rgba(255,255,255,0.05)",cursor:"pointer"}}>{ic}</button>)}</div>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,color:pal.sub,display:"block",marginBottom:6}}>{t.color}</label>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{ACT_COLORS.map(c=><div key={c} onClick={()=>setColor(c)} style={{width:26,height:26,borderRadius:"50%",background:c,cursor:"pointer",border:c===color?`3px solid ${tx}`:"3px solid transparent",boxSizing:"border-box"}}/>)}</div>
          </div>
          <div style={{marginBottom:20}}>
            <label style={{fontSize:11,color:pal.sub,display:"block",marginBottom:5}}>{t.weeklyGoal}</label>
            <div style={{display:"flex",gap:8,marginBottom:7}}>
              {["none","days"].map(tp=><button key={tp} onClick={()=>setGoalType(tp)} style={{flex:1,padding:"7px",borderRadius:10,border:`1px solid ${goalType===tp?pal.a1:pal.border}`,background:goalType===tp?pal.a1+"22":"transparent",color:goalType===tp?pal.a1:pal.sub,cursor:"pointer",fontWeight:600,fontSize:12}}>{tp==="none"?t.noGoal:t.daysPerWeek}</button>)}
            </div>
            {goalType==="days"&&<div style={{display:"flex",alignItems:"center",gap:10}}><input type="range" min={1} max={7} value={goalVal} onChange={e=>setGoalVal(+e.target.value)} style={{flex:1,accentColor:pal.a1}}/><span style={{color:tx,fontWeight:700,minWidth:60,fontSize:13}}>{goalVal}{t.perWeek}</span></div>}
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={close} style={{flex:1,padding:"11px",borderRadius:12,background:"transparent",border:`1px solid ${pal.border}`,color:tx,fontWeight:600,cursor:"pointer"}}>{t.cancel}</button>
            <button onClick={()=>{onSave({...act,name:name.trim()||act.name,color,icon,category:cat,goalType,goalVal});close();}} style={{flex:2,padding:"11px",borderRadius:12,background:pal.a1,border:"none",color:"#fff",fontWeight:700,cursor:"pointer"}}>{t.save}</button>
          </div>
        </div>
      )}
    </SlideModal>
  );
}

// ── SwipeRow ──────────────────────────────────────────────────────────────────
function SwipeRow({children,onDelete}){
  const [ox,setOx]=useState(0),[sw,setSw]=useState(false),sx=useRef(null);
  return(
    <div style={{position:"relative",overflow:"hidden",borderRadius:12}}>
      <div style={{position:"absolute",right:0,top:0,bottom:0,width:72,background:"#ef4444",borderRadius:"0 12px 12px 0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🗑️</div>
      <div onTouchStart={e=>{sx.current=e.touches[0].clientX;setSw(true);}} onTouchMove={e=>{if(sx.current===null)return;setOx(Math.min(0,e.touches[0].clientX-sx.current));}} onTouchEnd={()=>{setSw(false);if(ox<-72)onDelete();else setOx(0);sx.current=null;}} style={{transform:`translateX(${ox}px)`,transition:sw?"none":"transform 0.3s ease",position:"relative",zIndex:1}}>{children}</div>
    </div>
  );
}

// ── DeleteConfirm ─────────────────────────────────────────────────────────────
function DeleteConfirm({actName,onConfirm,onClose,pal,t}){
  const tx=pal.text||"#fff";
  return(
    <SlideModal onClose={onClose} pal={pal}>
      {close=>(
        <div style={{textAlign:"center",color:tx}}>
          <div style={{fontSize:40,marginBottom:10}}>🗑️</div>
          <div style={{fontWeight:800,fontSize:17,marginBottom:7}}>{t.deleteConfirmTitle(actName)}</div>
          <div style={{color:pal.sub,fontSize:13,marginBottom:24,lineHeight:1.5}}>{t.deleteConfirmBody}</div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={close} style={{flex:1,padding:"12px",borderRadius:12,background:"transparent",border:`1px solid ${pal.border}`,color:tx,fontWeight:600,cursor:"pointer"}}>{t.cancel}</button>
            <button onClick={()=>{onConfirm();close();}} style={{flex:1,padding:"12px",borderRadius:12,background:"#ef4444",border:"none",color:"#fff",fontWeight:700,cursor:"pointer"}}>{t.deleteHabit}</button>
          </div>
        </div>
      )}
    </SlideModal>
  );
}

// ── Settings Panel ────────────────────────────────────────────────────────────
function SettingsPanel({palKey,setPalKey,lang,setLang,notifPerm,onEnableNotif,pal,t}){
  const tx=pal.text||"#fff";
  const palNames={green:"🌲 Forest",indigo:"🌌 Indigo",rose:"🌹 Rose",amber:"🌅 Amber",light:"☀️ Light"};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Theme */}
      <div style={{background:pal.card,border:`1px solid ${pal.border}`,borderRadius:16,padding:20}}>
        <div style={{fontWeight:700,fontSize:14,color:tx,marginBottom:14}}>🎨 {t.theme}</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {Object.entries(PALETTES).map(([k,p])=>(
            <button key={k} onClick={()=>setPalKey(k)} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:12,border:`1px solid ${k===palKey?p.a1:pal.border}`,background:k===palKey?p.a1+"18":"transparent",cursor:"pointer",width:"100%",textAlign:"left"}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${p.a1},${p.a2})`,flexShrink:0,border:k===palKey?`2px solid ${tx}`:"2px solid transparent",boxSizing:"border-box"}}/>
              <span style={{fontWeight:600,fontSize:14,color:k===palKey?p.a1:tx}}>{palNames[k]}</span>
              {k===palKey&&<span style={{marginLeft:"auto",color:p.a1,fontSize:16}}>✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div style={{background:pal.card,border:`1px solid ${pal.border}`,borderRadius:16,padding:20}}>
        <div style={{fontWeight:700,fontSize:14,color:tx,marginBottom:14}}>🌍 {t.language}</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {Object.entries(TRANSLATIONS).map(([k,v])=>(
            <button key={k} onClick={()=>setLang(k)} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:12,border:`1px solid ${k===lang?pal.a1:pal.border}`,background:k===lang?pal.a1+"18":"transparent",cursor:"pointer",width:"100%",textAlign:"left"}}>
              <span style={{fontSize:22}}>{v.flag}</span>
              <span style={{fontWeight:600,fontSize:14,color:k===lang?pal.a1:tx}}>{v.name}</span>
              {k===lang&&<span style={{marginLeft:"auto",color:pal.a1,fontSize:16}}>✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div style={{background:pal.card,border:`1px solid ${pal.border}`,borderRadius:16,padding:20}}>
        <div style={{fontWeight:700,fontSize:14,color:tx,marginBottom:5}}>{t.streakReminders}</div>
        <div style={{fontSize:13,color:pal.muted,marginBottom:12}}>{t.notifDesc}</div>
        {notifPerm==="granted"
          ?<div style={{color:pal.a1,fontWeight:600,fontSize:13}}>{t.notifEnabled}</div>
          :<button onClick={onEnableNotif} style={{padding:"9px 18px",borderRadius:10,background:pal.a1,border:"none",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13}}>{t.enableNotif}</button>}
      </div>
    </div>
  );
}

// ── Share card ────────────────────────────────────────────────────────────────
function drawShareCard(canvas,activities,log,streaks,pal,t){
  const ctx=canvas.getContext("2d"),W=canvas.width;
  const ac=Math.min(activities.length,10);
  const H=110+200+36+ac*38+20+120+30;canvas.height=H;
  const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,pal.bg0);bg.addColorStop(1,pal.bg2);
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  ctx.fillStyle="rgba(255,255,255,0.04)";
  for(let x=20;x<W;x+=28)for(let y=20;y<H;y+=28){ctx.beginPath();ctx.arc(x,y,1.5,0,Math.PI*2);ctx.fill();}
  const tx2=pal.text||"#fff";
  ctx.fillStyle=tx2;ctx.font="bold 30px system-ui";ctx.fillText("Chainly ⛓️",36,52);
  ctx.fillStyle=pal.a1;ctx.fillRect(36,62,100,3);
  ctx.fillStyle=pal.sub||"#888";ctx.font="13px system-ui";ctx.fillText(new Date().toDateString(),36,90);
  let os=0,d=new Date();
  for(let i=0;i<365;i++){const k=toKey(d);if(log[k]&&(Object.values(log[k]).some(x=>x?.done)||log[k].__rest__?.done)){os++;}else break;d.setDate(d.getDate()-1);}
  const totalDays=Object.keys(log).filter(k=>Object.values(log[k]).some(x=>x?.done)).length;
  const tw=[0,1,2,3,4,5,6].map(i=>{const d2=new Date();d2.setDate(d2.getDate()-i);return toKey(d2);});
  const wr=Math.round(tw.filter(k=>log[k]&&Object.values(log[k]).some(x=>x?.done)).length/7*100);
  [{label:`🔥 ${t.overallStreak}`,val:t.days(os)},{label:`📅 ${t.activeDays}`,val:String(totalDays)},{label:`📊 ${t.week}`,val:`${wr}%`},{label:`🎯 ${t.habits}`,val:String(activities.length)}].forEach((b,i)=>{
    const x=36+(i%2)*220,y=110+Math.floor(i/2)*90;
    ctx.fillStyle="rgba(255,255,255,0.06)";ctx.beginPath();ctx.roundRect(x,y,200,70,12);ctx.fill();
    ctx.strokeStyle=pal.a1+"55";ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(x,y,200,70,12);ctx.stroke();
    ctx.fillStyle=pal.sub||"#aaa";ctx.font="11px system-ui";ctx.fillText(b.label,x+14,y+20);
    ctx.fillStyle=tx2;ctx.font="bold 26px system-ui";ctx.fillText(b.val,x+14,y+52);
  });
  ctx.fillStyle=tx2;ctx.font="bold 15px system-ui";ctx.fillText(t.habitStreaksCard,36,346);
  activities.slice(0,10).forEach((a,i)=>{
    const y=362+i*38;
    ctx.fillStyle=a.color+"33";ctx.beginPath();ctx.roundRect(36,y,W-72,30,8);ctx.fill();
    const s=streaks[a.id]||{current:0};
    ctx.fillStyle=a.color;ctx.beginPath();ctx.arc(56,y+15,8,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=tx2;ctx.font="13px system-ui";ctx.fillText((a.icon||"")+" "+a.name,72,y+19);
    ctx.fillStyle=a.color;ctx.font="bold 13px system-ui";ctx.fillText("🔥 "+t.days(s.current),W-90,y+19);
  });
  const hmY=110+200+36+ac*38+20;
  ctx.fillStyle=tx2;ctx.font="bold 15px system-ui";ctx.fillText(t.last4weeks,36,hmY+16);
  for(let w=0;w<28;w++){
    const dd=new Date();dd.setDate(dd.getDate()-(27-w));
    const k=toKey(dd),done=log[k]?Object.values(log[k]).filter(x=>x?.done).length:0;
    const alpha=done===0?0.06:0.15+done/Math.max(activities.length,1)*0.85;
    ctx.fillStyle=done===0?"rgba(255,255,255,0.06)":`rgba(${hexToRgb(pal.a1)},${alpha})`;
    ctx.beginPath();ctx.roundRect(36+(w%7)*42,hmY+28+Math.floor(w/7)*18,34,12,4);ctx.fill();
  }
  ctx.fillStyle="#555";ctx.font="12px system-ui";ctx.fillText(t.madeWith,36,H-10);
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App(){
  const [loaded,setLoaded]=useState(false);
  const [lang,setLang]=useState("en");
  const [tab,setTab]=useState("checkin");
  const [activities,setActivities]=useState([]);
  const [log,setLog]=useState({});
  const [palKey,setPalKey]=useState("green");
  const [onboarded,setOnboarded]=useState(false);
  const [newName,setNewName]=useState("");
  const [newCat,setNewCat]=useState("sport");
  const [shareReady,setShareReady]=useState(false);
  const [dayModal,setDayModal]=useState(null);
  const [editAct,setEditAct]=useState(null);
  const [deleteAct,setDeleteAct]=useState(null);
  const [pulseId,setPulseId]=useState(null);
  const [notifPerm,setNotifPerm]=useState("default");
  const [toast,setToast]=useState(null);
  const [showWeekly,setShowWeekly]=useState(false);
  const [freezesUsed,setFreezesUsed]=useState({});
  const canvasRef=useRef();
  const seenMilestones=useRef(new Set(lsGet("st_milestones",[])));
  const prefersDark=window.matchMedia&&window.matchMedia("(prefers-color-scheme:dark)").matches;

  useEffect(()=>{
    setActivities(lsGet("st_activities",[]));
    setLog(migrateLog(lsGet("st_log",{})));
    setLang(lsGet("st_lang",detectLang()));
    setPalKey(lsGet("st_palette",prefersDark?"green":"light"));
    setOnboarded(lsGet("st_onboarded",false));
    setFreezesUsed(lsGet("st_freezes",{}));
    if(typeof Notification!=="undefined")setNotifPerm(Notification.permission);
    const now=new Date();
    if(now.getDay()===0){const wk=toKey(now).slice(0,7);if(lsGet("st_review_seen","")!==wk){setShowWeekly(true);lsSet("st_review_seen",wk);}}
    setLoaded(true);
  },[]);

  useEffect(()=>{if(loaded){lsSet("st_activities",activities);lsSet("st_log",log);lsSet("st_palette",palKey);lsSet("st_freezes",freezesUsed);lsSet("st_lang",lang);}},[activities,log,palKey,freezesUsed,lang,loaded]);

  const pal=PALETTES[palKey]||PALETTES.green,tx=pal.text||"#fff",t=TRANSLATIONS[lang]||TRANSLATIONS.en,isRTL=lang==="ar";
  const todayKey=today(),yesterdayKey=yesterday();
  const catLabel=(c)=>({sport:t.catSport,mind:t.catMind,health:t.catHealth,other:t.catOther}[c]||c);
  const catEmoji=(c)=>({sport:"🏃",mind:"🧠",health:"💧",other:"⭐"}[c]||"⭐");

  function getStreaks(){
    const res={};
    activities.forEach(a=>{
      let cur=0,best=0,run=0;
      Object.keys(log).sort().forEach(k=>{const e=log[k]||{};if(e[a.id]?.done||(a.category==="sport"&&e.__rest__?.done)){run++;best=Math.max(best,run);}else run=0;});
      let d=new Date();
      const todayDone=log[todayKey]?.[a.id]?.done,todayRest=a.category==="sport"&&log[todayKey]?.__rest__?.done;
      if(!todayDone&&!todayRest)d.setDate(d.getDate()-1);
      for(let i=0;i<365;i++){const k=toKey(d),e=log[k]||{};if(e[a.id]?.done||(a.category==="sport"&&e.__rest__?.done)){cur++;best=Math.max(best,cur);}else break;d.setDate(d.getDate()-1);}
      res[a.id]={current:cur,best};
    });
    return res;
  }
  const streaks=getStreaks();

  useEffect(()=>{
    if(!loaded)return;
    activities.forEach(a=>{const cur=(streaks[a.id]||{}).current||0;MILESTONES.forEach(m=>{const key=`${a.id}-${m}`;if(cur>=m&&!seenMilestones.current.has(key)){seenMilestones.current.add(key);lsSet("st_milestones",[...seenMilestones.current]);setToast({milestone:m,actName:a.name});}});});
  },[log,loaded]);

  let overallStreak=0;
  {let d=new Date();const th=log[todayKey]&&(Object.values(log[todayKey]).some(x=>x?.done)||log[todayKey].__rest__?.done);if(!th)d.setDate(d.getDate()-1);for(let i=0;i<365;i++){const k=toKey(d),e=log[k]||{};if(Object.values(e).some(x=>x?.done)||e.__rest__?.done){overallStreak++;d.setDate(d.getDate()-1);}else break;}}
  const totalActive=Object.keys(log).filter(k=>Object.values(log[k]).some(x=>x?.done)).length;
  const last7=Array.from({length:7},(_,i)=>toKey(daysAgo(i)));
  const weeklyDone=last7.filter(k=>log[k]&&Object.values(log[k]).some(x=>x?.done)).length;
  const totalCompletions=Object.values(log).reduce((s,d)=>s+Object.values(d).filter(x=>x?.done).length,0);
  const dowCounts=Array(7).fill(0);Object.keys(log).forEach(k=>{if(Object.values(log[k]).some(x=>x?.done)){dowCounts[new Date(k+"T12:00:00").getDay()]++;}});
  const bestDow=DAYS_EN[dowCounts.indexOf(Math.max(...dowCounts))];
  const months=Array.from({length:6},(_,i)=>{const d=new Date();d.setMonth(d.getMonth()-5+i);return d.toISOString().slice(0,7);});
  const monthlyCounts={};Object.keys(log).forEach(k=>{if(Object.values(log[k]).some(x=>x?.done)){const m=k.slice(0,7);monthlyCounts[m]=(monthlyCounts[m]||0)+1;}});
  const longestOverall=Math.max(...activities.map(a=>(streaks[a.id]||{}).best||0),0);
  function mostActiveWeek(){let b=0;for(let w=0;w<52;w++){const c=Array.from({length:7},(_,d)=>toKey(daysAgo(w*7+d))).filter(k=>log[k]&&Object.values(log[k]).some(x=>x?.done)).length;b=Math.max(b,c);}return b;}

  const thisMonth=today().slice(0,7),freezeAvailable=!freezesUsed[thisMonth];
  const daysUntilFreeze=daysUntilNextMonth();

  const todayLog=log[todayKey]||{},isRestToday=todayLog.__rest__?.done;
  const hasSportToday=activities.some(a=>a.category==="sport");

  function toggle(id,dateKey=todayKey){setPulseId(id);setTimeout(()=>setPulseId(null),600);haptic("medium");setLog(prev=>({...prev,[dateKey]:{...prev[dateKey],[id]:{...prev[dateKey]?.[id],done:!prev[dateKey]?.[id]?.done}}}));}
  function setNote(dk,ai,note){setLog(prev=>({...prev,[dk]:{...prev[dk],[ai]:{...prev[dk]?.[ai],note}}}));}
  function toggleRest(dateKey){haptic();setLog(prev=>({...prev,[dateKey]:{...prev[dateKey],__rest__:{done:!prev[dateKey]?.__rest__?.done}}}));}
  function addActivity(){const name=newName.trim();if(!name)return;const id=Date.now().toString(),color=ACT_COLORS[activities.length%ACT_COLORS.length],icon=ACT_ICONS[activities.length%ACT_ICONS.length];setActivities(prev=>[...prev,{id,name,color,icon,category:newCat,goalType:"none",goalVal:3}]);setNewName("");haptic();}
  function saveActivity(u){setActivities(prev=>prev.map(a=>a.id===u.id?u:a));}
  function removeActivity(id){setActivities(prev=>prev.filter(a=>a.id!==id));setLog(prev=>{const n={...prev};Object.keys(n).forEach(k=>{if(n[k][id]!==undefined){n[k]={...n[k]};delete n[k][id];}});return n;});}
  function weekGoalProgress(a){if(a.goalType!=="days")return null;const done=last7.filter(k=>log[k]?.[a.id]?.done).length;return{done,goal:a.goalVal,pct:Math.min(100,Math.round(done/a.goalVal*100))};}

  const heatmap=Array.from({length:112},(_,i)=>{const d=daysAgo(111-i),k=toKey(d);return{k,done:log[k]?Object.values(log[k]).filter(x=>x?.done).length:0,isRest:log[k]?.__rest__?.done};});
  const bars=Array.from({length:7},(_,i)=>{const d=daysAgo(6-i),k=toKey(d);return{label:DAYS_EN[d.getDay()],done:log[k]?Object.values(log[k]).filter(x=>x?.done).length:0,k};});
  const maxBar=Math.max(...bars.map(b=>b.done),1);

  async function enableNotifications(){if(typeof Notification==="undefined")return;const p=await Notification.requestPermission();setNotifPerm(p);if(p==="granted"){const now=new Date(),tm=new Date();tm.setHours(20,0,0,0);if(now>tm)tm.setDate(tm.getDate()+1);setTimeout(()=>{if(!(log[today()]&&Object.values(log[today()]).some(x=>x?.done))&&overallStreak>0)new Notification("🔥 Chainly",{body:`${overallStreak}d streak at risk!`});},tm-now);}}
  function renderShare(){const c=canvasRef.current;c.width=492;drawShareCard(c,activities,log,streaks,pal,t);setShareReady(true);}
  function downloadPNG(){const a=document.createElement("a");a.download="chainly-stats.png";a.href=canvasRef.current.toDataURL("image/png");a.click();}
  function shareTwitter(){window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(t.shareText(overallStreak,totalActive,weeklyDone))}`,"_blank");}
  function shareWhatsApp(){window.open(`https://wa.me/?text=${encodeURIComponent(t.shareWa(overallStreak,totalActive,weeklyDone))}`,"_blank");}
  async function copyImg(){canvasRef.current.toBlob(async b=>{try{await navigator.clipboard.write([new ClipboardItem({"image/png":b})]);alert(t.copied);}catch{alert(t.copyFail);}});}

  const cardStyle={background:pal.card,border:`1px solid ${pal.border}`,borderRadius:16,padding:18};
  const tabs=[{id:"checkin",label:t.checkin,icon:"✅"},{id:"stats",label:t.stats,icon:"📊"},{id:"habits",label:t.habits,icon:"⛓️"},{id:"share",label:t.share,icon:"📤"},{id:"settings",label:t.settings,icon:"⚙️"}];

  if(!loaded)return <Skeleton pal={PALETTES[lsGet("st_palette","green")]||PALETTES.green}/>;

  return(
    <div style={{minHeight:"100vh",background:pal.bg0,color:tx,fontFamily:"system-ui,sans-serif",paddingBottom:40,direction:isRTL?"rtl":"ltr"}}>
      <style>{`* { -webkit-tap-highlight-color: transparent; }`}</style>

      {!onboarded&&<Onboarding onDone={()=>{setOnboarded(true);lsSet("st_onboarded",true);}} pal={pal} t={t}/>}
      {showWeekly&&<SlideModal onClose={()=>setShowWeekly(false)} pal={pal}>{close=><WeeklyReview log={log} activities={activities} streaks={streaks} onClose={close} pal={pal} t={t}/>}</SlideModal>}
      {dayModal&&<DayModal dateKey={dayModal} activities={activities} log={log} onClose={()=>setDayModal(null)} onToggle={toggle} onNote={setNote} onRestDay={toggleRest} pal={pal} t={t}/>}
      {editAct&&<EditModal act={editAct} onSave={a=>{saveActivity(a);setEditAct(null);}} onClose={()=>setEditAct(null)} pal={pal} t={t}/>}
      {deleteAct&&<DeleteConfirm actName={deleteAct.name} onConfirm={()=>removeActivity(deleteAct.id)} onClose={()=>setDeleteAct(null)} pal={pal} t={t}/>}
      {toast&&<MilestoneToast milestone={toast.milestone} actName={toast.actName} onClose={()=>setToast(null)} pal={pal} t={t}/>}

      {/* Header */}
      <div style={{background:`linear-gradient(135deg,${pal.bg1},${pal.bg2})`,borderBottom:`1px solid ${pal.border}`,padding:"16px 18px 0"}}>
        <div style={{maxWidth:640,margin:"0 auto"}}>
          <div style={{marginBottom:12}}>
            <h1 style={{margin:"0 0 2px",fontSize:22,fontWeight:800,color:pal.a1}}>Chainly ⛓️</h1>
            <p style={{margin:0,color:pal.sub,fontSize:12}}>{new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"})}</p>
          </div>
          <div style={{display:"flex",gap:0,overflowX:"auto"}}>
            {tabs.map(tb=>(
              <button key={tb.id} onClick={()=>setTab(tb.id)} style={{padding:"8px 13px",borderRadius:"10px 10px 0 0",border:"none",cursor:"pointer",fontWeight:600,fontSize:12,whiteSpace:"nowrap",background:tab===tb.id?pal.a1:"transparent",color:tab===tb.id?"#fff":pal.sub,borderBottom:tab===tb.id?`2px solid ${pal.a1}`:"2px solid transparent",display:"flex",alignItems:"center",gap:5}}>
                <span style={{fontSize:13}}>{tb.icon}</span> {tb.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:640,margin:"18px auto",padding:"0 14px"}}>

        {/* CHECK-IN */}
        {tab==="checkin"&&<div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
            {[["🔥",t.streak,t.days(overallStreak)],["📅",t.active,totalActive],["📊",t.week,`${weeklyDone}/7`]].map(([e,l,v])=>(
              <div key={l} style={{...cardStyle,textAlign:"center",padding:12}}><div style={{fontSize:18}}>{e}</div><div style={{fontSize:18,fontWeight:800,color:pal.a1}}>{v}</div><div style={{fontSize:10,color:pal.muted,marginTop:1}}>{l}</div></div>
            ))}
          </div>

          {/* Rest + Freeze */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            {hasSportToday
              ?<button onClick={()=>toggleRest(todayKey)} style={{padding:"10px",borderRadius:12,background:isRestToday?pal.a1+"33":"rgba(255,255,255,0.03)",border:`1px solid ${isRestToday?pal.a1:pal.border}`,color:isRestToday?pal.a1:pal.sub,fontWeight:700,cursor:"pointer",fontSize:12}}>{isRestToday?t.restDayDone:t.restDay}</button>
              :<div style={{padding:"10px",borderRadius:12,background:"rgba(255,255,255,0.02)",border:`1px solid rgba(255,255,255,0.04)`,color:pal.muted,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",lineHeight:1.3}}>{t.restDayNotApplicable}</div>
            }
            <button onClick={()=>{if(freezeAvailable){toggleRest(todayKey);setFreezesUsed(p=>({...p,[thisMonth]:true}));}}} style={{padding:"8px 10px",borderRadius:12,background:"rgba(255,255,255,0.02)",border:`1px solid ${freezeAvailable?pal.border:"rgba(255,255,255,0.04)"}`,color:freezeAvailable?pal.sub:pal.muted,fontWeight:700,cursor:freezeAvailable?"pointer":"default",fontSize:11,lineHeight:1.4,textAlign:"center"}}>
              <div>{freezeAvailable?t.streakFreeze:t.freezeUsed}</div>
              <div style={{fontSize:10,fontWeight:400,marginTop:2,color:pal.muted}}>{freezeAvailable?t.freezeOnceMonth:t.freezeRefillIn(daysUntilFreeze)}</div>
            </button>
          </div>

          {!(log[yesterdayKey]&&Object.values(log[yesterdayKey]).some(x=>x?.done))&&(
            <div onClick={()=>setDayModal(yesterdayKey)} style={{...cardStyle,padding:"11px 14px",marginBottom:12,cursor:"pointer",display:"flex",alignItems:"center",gap:10,borderColor:"#f59e0b55"}}>
              <span style={{fontSize:18}}>⏪</span>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"#f59e0b"}}>{t.forgotYesterday}</div><div style={{fontSize:11,color:pal.muted}}>{t.forgotYesterdayDesc}</div></div>
              <span style={{color:pal.muted}}>›</span>
            </div>
          )}

          <div style={cardStyle}>
            <h3 style={{margin:"0 0 12px",fontSize:14,color:pal.sub,fontWeight:600}}>{t.todayHabits}</h3>
            {activities.length===0&&<p style={{color:pal.muted,fontSize:14}}>{t.noHabitsYet}</p>}
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {activities.map(a=>{
                const done=!!todayLog[a.id]?.done,s=streaks[a.id]||{current:0},gp=weekGoalProgress(a),ip=pulseId===a.id;
                return(
                  <div key={a.id}>
                    <div onClick={()=>toggle(a.id)} style={{display:"flex",alignItems:"center",gap:11,padding:"11px 13px",borderRadius:12,cursor:"pointer",background:done?a.color+"22":"rgba(255,255,255,0.03)",border:`1px solid ${done?a.color+"66":pal.border}`,transition:"all 0.2s",transform:ip?"scale(1.02)":"scale(1)",boxShadow:ip?`0 0 20px ${a.color}55`:"none"}}>
                      <span style={{fontSize:19,flexShrink:0}}>{a.icon||"⭕"}</span>
                      <div style={{width:21,height:21,borderRadius:"50%",flexShrink:0,background:done?a.color:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,transition:"all 0.2s",boxShadow:ip&&done?`0 0 12px ${a.color}`:"none"}}>{done?"✓":""}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:14,color:done?a.color:tx}}>{a.name}</div>
                        <div style={{fontSize:11,color:pal.muted,marginTop:1,display:"flex",gap:6,alignItems:"center"}}>
                          <span>🔥{t.days(s.current)} · {t.bestStreak} {t.days(s.best)}</span>
                          <span style={{background:"rgba(255,255,255,0.07)",padding:"1px 6px",borderRadius:6,fontSize:10}}>{catEmoji(a.category)} {catLabel(a.category)}</span>
                        </div>
                      </div>
                      <div style={{fontSize:12,color:done?a.color:pal.muted,fontWeight:700}}>{done?t.done:t.tap}</div>
                    </div>
                    {gp&&<div style={{margin:"3px 0 0",padding:"5px 13px",borderRadius:"0 0 10px 10px",background:"rgba(255,255,255,0.02)",border:`1px solid ${pal.border}`,borderTop:"none"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:10,color:pal.sub}}>{t.weeklyGoal}</span><span style={{fontSize:10,color:gp.done>=gp.goal?pal.a1:pal.sub,fontWeight:700}}>{gp.done}/{gp.goal}{t.perWeek}</span></div>
                      <div style={{height:3,borderRadius:2,background:"rgba(255,255,255,0.06)"}}><div style={{height:"100%",borderRadius:2,background:gp.done>=gp.goal?pal.a1:a.color,width:gp.pct+"%",transition:"width 0.4s"}}/></div>
                    </div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>}

        {/* STATS */}
        {tab==="stats"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[["🔥",t.overallStreak,t.days(overallStreak)],["📅",t.activeDays,totalActive],["💪",t.completions,totalCompletions],["📆",t.bestDay,bestDow],["🏆",t.longestStreak,t.days(longestOverall)],["📈",t.bestWeek,`${mostActiveWeek()}/7`]].map(([e,l,v])=>(
              <div key={l} style={{...cardStyle,padding:13}}><div style={{fontSize:19,marginBottom:2}}>{e}</div><div style={{fontSize:19,fontWeight:800,color:pal.a1}}>{v}</div><div style={{fontSize:10,color:pal.muted,marginTop:1}}>{l}</div></div>
            ))}
          </div>
          <div style={cardStyle}>
            <h3 style={{margin:"0 0 11px",fontSize:13,color:pal.sub}}>{t.thisWeek} <span style={{fontSize:10,color:pal.muted}}>({t.tapToView})</span></h3>
            <div style={{display:"flex",alignItems:"flex-end",gap:6,height:95}}>
              {bars.map(b=>(
                <div key={b.k} onClick={()=>setDayModal(b.k)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer"}}>
                  <div style={{fontSize:10,color:pal.a1,fontWeight:700}}>{b.done>0?b.done:""}</div>
                  <div style={{width:"100%",borderRadius:5,height:b.done===0?4:Math.max(8,b.done/maxBar*78),background:b.k===todayKey?pal.a1:b.done>0?pal.a1+"80":"rgba(255,255,255,0.06)",transition:"height 0.5s"}}/>
                  <div style={{fontSize:10,color:b.k===todayKey?pal.a1:pal.muted}}>{b.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={cardStyle}>
            <h3 style={{margin:"0 0 11px",fontSize:13,color:pal.sub}}>{t.monthlyActiveDays}</h3>
            <div style={{display:"flex",alignItems:"flex-end",gap:6,height:75}}>
              {months.map(m=>{const v=monthlyCounts[m]||0,max=Math.max(...months.map(x=>monthlyCounts[x]||0),1);return(
                <div key={m} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  <div style={{fontSize:9,color:pal.a1,fontWeight:700}}>{v||""}</div>
                  <div style={{width:"100%",borderRadius:4,height:v===0?4:Math.max(5,v/max*55),background:v>0?pal.a1+"99":"rgba(255,255,255,0.06)",transition:"height 0.4s"}}/>
                  <div style={{fontSize:9,color:pal.muted}}>{m.slice(5)}</div>
                </div>
              );})}
            </div>
          </div>
          <div style={cardStyle}>
            <h3 style={{margin:"0 0 11px",fontSize:13,color:pal.sub}}>{t.habitStreaks}</h3>
            {activities.length===0&&<p style={{color:pal.muted,fontSize:13}}>—</p>}
            {activities.map(a=>{const s=streaks[a.id]||{current:0,best:0};const pct=s.best>0?Math.round(s.current/s.best*100):0;const cr=Math.round(Object.values(log).filter(d=>d[a.id]?.done).length/Math.max(Object.keys(log).length,1)*100);return(
              <div key={a.id} style={{marginBottom:13}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontWeight:600,fontSize:13}}>{a.icon} <span style={{color:a.color}}>●</span> {a.name} <span style={{fontSize:10,color:pal.muted,background:"rgba(255,255,255,0.07)",padding:"1px 5px",borderRadius:5}}>{catEmoji(a.category)}</span></span>
                  <span style={{fontSize:11,color:pal.sub}}>🔥{t.days(s.current)} · {t.days(s.best)} · {cr}%</span>
                </div>
                <div style={{height:5,borderRadius:3,background:"rgba(255,255,255,0.06)"}}><div style={{height:"100%",borderRadius:3,background:a.color,width:pct+"%",transition:"width 0.5s"}}/></div>
              </div>
            );})}
          </div>
          <div style={cardStyle}>
            <h3 style={{margin:"0 0 8px",fontSize:13,color:pal.sub}}>{t.heatmap} <span style={{fontSize:10,color:pal.muted}}>({t.tapCell})</span></h3>
            <div style={{display:"grid",gridTemplateColumns:"repeat(16,1fr)",gap:2}}>
              {Array.from({length:16},(_,w)=>Array.from({length:7},(_,d)=>{const cell=heatmap[w*7+d];if(!cell)return<div key={`${w}-${d}`}/>;const alpha=cell.done===0?0.06:0.15+cell.done/Math.max(activities.length,1)*0.85;return<div key={cell.k} onClick={()=>setDayModal(cell.k)} style={{aspectRatio:"1",borderRadius:2,cursor:"pointer",background:cell.isRest?`rgba(${hexToRgb(pal.a1)},0.15)`:cell.done===0?"rgba(255,255,255,0.06)":`rgba(${hexToRgb(pal.a1)},${alpha})`,border:cell.k===todayKey?`1px solid ${pal.a1}`:cell.isRest?`1px solid ${pal.a1}44`:"none"}}/>; }))}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:5,marginTop:7,fontSize:10,color:pal.muted}}>
              <span>{t.less}</span>{[0.06,0.3,0.5,0.7,0.95].map(a=><div key={a} style={{width:10,height:10,borderRadius:2,background:`rgba(${hexToRgb(pal.a1)},${a})`}}/>)}<span>{t.more}</span>
            </div>
          </div>
        </div>}

        {/* HABITS */}
        {tab==="habits"&&<div style={cardStyle}>
          <h3 style={{margin:"0 0 12px",fontSize:14,color:pal.sub}}>{t.myHabits}</h3>
          {/* Category picker for new habit */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:10}}>
            {CATEGORIES.map(c=>(
              <button key={c} onClick={()=>setNewCat(c)} style={{padding:"7px 10px",borderRadius:10,border:`1px solid ${newCat===c?pal.a1:pal.border}`,background:newCat===c?pal.a1+"22":"transparent",color:newCat===c?pal.a1:pal.sub,cursor:"pointer",fontWeight:600,fontSize:12,display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:15}}>{catEmoji(c)}</span>{catLabel(c)}
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            <input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addActivity()} placeholder={t.newHabitPlaceholder} style={{flex:1,padding:"9px 13px",borderRadius:10,background:"rgba(255,255,255,0.06)",border:`1px solid ${pal.border}`,color:tx,fontSize:14,outline:"none"}}/>
            <button onClick={addActivity} style={{padding:"9px 16px",borderRadius:10,background:pal.a1,border:"none",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:14}}>{t.add}</button>
          </div>
          <div style={{fontSize:11,color:pal.muted,marginBottom:9}}>{t.swipeToDelete}</div>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {activities.length===0&&<p style={{color:pal.muted,fontSize:13}}>{t.noHabitsYet}</p>}
            {activities.map(a=>{const gp=weekGoalProgress(a);return(
              <SwipeRow key={a.id} onDelete={()=>setDeleteAct(a)}>
                <div style={{padding:"11px 13px",borderRadius:12,background:"rgba(255,255,255,0.03)",border:`1px solid ${pal.border}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <span style={{fontSize:18}}>{a.icon||"⭕"}</span>
                    <div style={{width:9,height:9,borderRadius:"50%",background:a.color,flexShrink:0}}/>
                    <span style={{flex:1,fontWeight:600,fontSize:13,color:tx}}>{a.name}</span>
                    <span style={{fontSize:10,color:pal.muted,background:"rgba(255,255,255,0.07)",padding:"2px 6px",borderRadius:6}}>{catEmoji(a.category)} {catLabel(a.category)}</span>
                    {a.goalType==="days"&&<span style={{fontSize:10,color:pal.a1,fontWeight:600}}>{a.goalVal}{t.perWeek}</span>}
                    <button onClick={()=>setEditAct(a)} style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${pal.border}`,color:tx,borderRadius:8,padding:"3px 9px",cursor:"pointer",fontSize:11}}>{t.edit}</button>
                  </div>
                  {gp&&<div style={{marginTop:6}}><div style={{height:3,borderRadius:2,background:"rgba(255,255,255,0.06)"}}><div style={{height:"100%",borderRadius:2,background:gp.done>=gp.goal?pal.a1:a.color,width:gp.pct+"%",transition:"width 0.4s"}}/></div><div style={{fontSize:10,color:pal.muted,marginTop:2}}>{gp.done}/{gp.goal} {t.thisWeekCount}</div></div>}
                </div>
              </SwipeRow>
            );})}
          </div>
        </div>}

        {/* SHARE */}
        {tab==="share"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={cardStyle}>
            <h3 style={{margin:"0 0 5px",fontSize:14,color:pal.sub}}>{t.shareProgress}</h3>
            <p style={{margin:"0 0 14px",fontSize:12,color:pal.muted}}>{t.shareDesc}</p>
            <button onClick={renderShare} style={{width:"100%",padding:"12px",borderRadius:12,background:`linear-gradient(135deg,${pal.a1},${pal.a2})`,border:"none",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>{t.generateCard}</button>
          </div>
          <canvas ref={canvasRef} style={{display:"none"}}/>
          {shareReady&&<div style={cardStyle}>
            <img src={canvasRef.current.toDataURL()} alt="Stats" style={{width:"100%",borderRadius:12,marginBottom:12}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:9}}>
              <button onClick={downloadPNG} style={{padding:"10px",borderRadius:10,background:pal.a1,border:"none",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13}}>{t.download}</button>
              <button onClick={copyImg} style={{padding:"10px",borderRadius:10,background:"rgba(255,255,255,0.08)",border:`1px solid ${pal.border}`,color:tx,fontWeight:700,cursor:"pointer",fontSize:13}}>{t.copy}</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
              <button onClick={shareTwitter} style={{padding:"10px",borderRadius:10,background:"#1da1f2",border:"none",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13}}>𝕏 Twitter</button>
              <button onClick={shareWhatsApp} style={{padding:"10px",borderRadius:10,background:"#25d366",border:"none",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13}}>💬 WhatsApp</button>
            </div>
          </div>}
        </div>}

        {/* SETTINGS */}
        {tab==="settings"&&<SettingsPanel palKey={palKey} setPalKey={setPalKey} lang={lang} setLang={setLang} notifPerm={notifPerm} onEnableNotif={enableNotifications} pal={pal} t={t}/>}

      </div>
    </div>
  );
}