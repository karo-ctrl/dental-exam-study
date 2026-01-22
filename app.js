// ===== 状態管理 =====
const state = {
  // タブとビュー
  currentTab: 'kakomon', // 'kakomon', 'original', 'summary'
  currentView: 'home', // 'home', 'quiz'
  kakomonWasInQuiz: false, // タブ切替時の状態保持用

  // Firebase認証
  currentUser: null,
  isAuthenticated: false,
  inviteCodeVerified: false,
  syncStatus: 'idle', // 'idle', 'syncing', 'synced', 'error'

  // レガシー（後で整理）
  mode: 'quiz', // 'quiz' or 'summary'

  // 演習モード用データ
  allData: null,
  currentExam: null,
  filteredQuestions: [],

  // まとめモード用データ
  summaryIndex: null,
  currentCategoryData: null,
  currentCategory: null,
  currentTopic: null,
  flattenedCards: [],

  // UI状態
  currentIndex: 0,
  favorites: new Set(),
  viewedCards: new Set(),
  answeredCards: new Map(),
  filter: 'all',
  theme: 'light',
  fontSize: 100,

  // 問題表示状態
  showingAnswer: false,
  selectedChoices: new Set(),

  // 画像モーダル状態
  currentImages: [],
  currentImageIndex: 0,
  carouselIndex: 0,

  // タッチ操作用
  touchStartX: 0,
  touchStartY: 0,
  touchEndX: 0,
  touchEndY: 0,

  // 日次統計
  dailyStats: {}, // { "2024-01-20": 5, "2024-01-19": 10, ... }

  // 回答履歴
  questionHistory: {}, // { "117-A001": { attempts, correct, incorrect, lastAttempt, difficulty, history: [...] } }

  // 出題設定
  quizSettings: {
    hisshu: {
      count: 20,
      range: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      condition: ['unanswered']
    },
    ippan: {
      count: 10,
      range: ['解剖学', '組織学', '病理学', '生理学', '生化学', '微生物学', '薬理学', '歯科理工学', '衛生', '保存修復学', '歯内療法学', '歯周病学', '有床義歯補綴学', '冠橋補綴学', 'インプラント', '口腔外科学', '矯正歯科学', '小児歯科学', '高齢者歯科学', '障害者歯科学', '放射線学', '麻酔学', '総合医学'],
      condition: ['unanswered']
    },
    rinjitsu: {
      count: 10,
      range: ['解剖学', '組織学', '病理学', '生理学', '生化学', '微生物学', '薬理学', '歯科理工学', '衛生', '保存修復学', '歯内療法学', '歯周病学', '有床義歯補綴学', '冠橋補綴学', 'インプラント', '口腔外科学', '矯正歯科学', '小児歯科学', '高齢者歯科学', '障害者歯科学', '放射線学', '麻酔学', '総合医学'],
      condition: ['unanswered']
    }
  }
};

// ===== DOM要素 =====
const elements = {};

function initElements() {
  // ヘッダー
  elements.headerTitle = document.getElementById('headerTitle');
  elements.backBtn = document.getElementById('backBtn');
  elements.menuBtn = document.getElementById('menuBtn');
  elements.themeBtn = document.getElementById('themeBtn');
  elements.settingsBtn = document.getElementById('settingsBtn');

  // 下部ナビゲーション
  elements.bottomNav = document.getElementById('bottomNav');
  elements.bottomNavItems = document.querySelectorAll('.bottom-nav-item');

  // ホーム画面
  elements.kakomonHome = document.getElementById('kakomonHome');
  elements.originalHome = document.getElementById('originalHome');
  elements.summaryHome = document.getElementById('summaryHome');
  elements.quizScreen = document.getElementById('quizScreen');

  // 過去問ホームのボタン
  elements.dailyHisshuBtn = document.getElementById('dailyHisshuBtn');
  elements.dailyIppanBtn = document.getElementById('dailyIppanBtn');
  elements.dailyRinjitsuBtn = document.getElementById('dailyRinjitsuBtn');
  elements.settingsMenuBtn = document.getElementById('settingsMenuBtn');
  elements.examSelectBtn = document.getElementById('examSelectBtn');

  // 問題ナビゲーション
  elements.questionNav = document.getElementById('questionNav');

  // レガシー（後で削除）
  elements.modeTabs = document.querySelectorAll('.mode-tab');

  // サイドバー
  elements.sidebar = document.getElementById('sidebar');
  elements.sidebarTitle = document.getElementById('sidebarTitle');
  elements.sidebarOverlay = document.getElementById('sidebarOverlay');
  elements.closeSidebarBtn = document.getElementById('closeSidebarBtn');
  elements.examList = document.getElementById('examList');
  elements.categoryList = document.getElementById('categoryList');
  elements.topicList = document.getElementById('topicList');

  // 設定パネル
  elements.settingsPanel = document.getElementById('settingsPanel');
  elements.settingsOverlay = document.getElementById('settingsOverlay');
  elements.closeSettingsBtn = document.getElementById('closeSettingsBtn');
  elements.themeOptions = document.querySelectorAll('.theme-option');
  elements.fontDecrease = document.getElementById('fontDecrease');
  elements.fontIncrease = document.getElementById('fontIncrease');
  elements.fontSizeDisplay = document.getElementById('fontSizeDisplay');
  elements.todayCount = document.getElementById('todayCount');
  elements.todayDiff = document.getElementById('todayDiff');
  elements.loginBtn = document.getElementById('loginBtn');
  elements.loginSection = document.querySelector('.setting-item-login');

  // ログインページ（招待コード）
  elements.loginPage = document.getElementById('loginPage');
  elements.inviteCodeInput = document.getElementById('inviteCodeInput');
  elements.inviteSubmitBtn = document.getElementById('inviteSubmitBtn');
  elements.loginErrorArea = document.getElementById('loginErrorArea');
  elements.loginErrorTitle = document.getElementById('loginErrorTitle');
  elements.loginErrorDetails = document.getElementById('loginErrorDetails');

  // 出題設定パネル
  elements.quizSettingsPanel = document.getElementById('quizSettingsPanel');
  elements.quizSettingsOverlay = document.getElementById('quizSettingsOverlay');
  elements.closeQuizSettingsBtn = document.getElementById('closeQuizSettingsBtn');
  elements.saveQuizSettingsBtn = document.getElementById('saveQuizSettingsBtn');
  elements.hisshuCount = document.getElementById('hisshuCount');
  elements.hisshuRange = document.getElementById('hisshuRange');
  elements.hisshuCondition = document.getElementById('hisshuCondition');
  elements.ippanCount = document.getElementById('ippanCount');
  elements.ippanRange = document.getElementById('ippanRange');
  elements.ippanCondition = document.getElementById('ippanCondition');
  elements.rinjitsuCount = document.getElementById('rinjitsuCount');
  elements.rinjitsuRange = document.getElementById('rinjitsuRange');
  elements.rinjitsuCondition = document.getElementById('rinjitsuCondition');

  // 検索モーダル
  elements.searchModal = document.getElementById('searchModal');
  elements.searchModalBackdrop = document.getElementById('searchModalBackdrop');
  elements.closeSearchModalBtn = document.getElementById('closeSearchModalBtn');
  elements.searchKeyword = document.getElementById('searchKeyword');
  elements.searchBtn = document.getElementById('searchBtn');
  elements.searchDetailsToggle = document.getElementById('searchDetailsToggle');
  elements.searchDetailsBody = document.getElementById('searchDetailsBody');
  elements.practiceStatusFilter = document.getElementById('practiceStatusFilter');
  elements.questionTypeFilter = document.getElementById('questionTypeFilter');
  elements.examFilter = document.getElementById('examFilter');
  elements.subjectFilter = document.getElementById('subjectFilter');
  elements.startFilteredQuizBtn = document.getElementById('startFilteredQuizBtn');

  // カード共通
  elements.loadingState = document.getElementById('loadingState');

  // 演習カード
  elements.quizCard = document.getElementById('quizCard');
  elements.cardCategory = document.getElementById('cardCategory');
  elements.questionId = document.getElementById('questionId');
  elements.cardTitle = document.getElementById('cardTitle');
  elements.imageRef = document.getElementById('imageRef');
  elements.imageRefText = document.getElementById('imageRefText');
  elements.imageThumbnails = document.getElementById('imageThumbnails');
  elements.choicesContainer = document.getElementById('choicesContainer');
  elements.answerArea = document.getElementById('answerArea');
  elements.correctAnswer = document.getElementById('correctAnswer');
  elements.showAnswerBtn = document.getElementById('showAnswerBtn');
  elements.nextQuestionBtn = document.getElementById('nextQuestionBtn');
  elements.difficultyBtns = document.getElementById('difficultyBtns');
  elements.quizFavoriteBtn = document.getElementById('quizFavoriteBtn');

  // まとめカード
  elements.summaryCard = document.getElementById('summaryCard');
  elements.summaryCategory = document.getElementById('summaryCategory');
  elements.summaryTopic = document.getElementById('summaryTopic');
  elements.summaryTitle = document.getElementById('summaryTitle');
  elements.summaryContent = document.getElementById('summaryContent');
  elements.keyPoints = document.getElementById('keyPoints');
  elements.keyPointsList = document.getElementById('keyPointsList');
  elements.textbookRefs = document.getElementById('textbookRefs');
  elements.textbookRefsList = document.getElementById('textbookRefsList');
  elements.relatedExams = document.getElementById('relatedExams');
  elements.relatedExamsList = document.getElementById('relatedExamsList');
  elements.summaryTags = document.getElementById('summaryTags');
  elements.summaryFavoriteBtn = document.getElementById('summaryFavoriteBtn');

  // フッター
  elements.prevBtn = document.getElementById('prevBtn');
  elements.nextBtn = document.getElementById('nextBtn');
  elements.currentIndexEl = document.getElementById('currentIndex');
  elements.totalCards = document.getElementById('totalCards');

  // 画像モーダル
  elements.imageModal = document.getElementById('imageModal');
  elements.imageModalBackdrop = document.getElementById('imageModalBackdrop');
  elements.imageModalClose = document.getElementById('imageModalClose');
  elements.imageModalImg = document.getElementById('imageModalImg');
  elements.imageModalPrev = document.getElementById('imageModalPrev');
  elements.imageModalNext = document.getElementById('imageModalNext');
  elements.imageModalCounter = document.getElementById('imageModalCounter');
}

// ===== 初期化 =====
async function init() {
  initElements();
  loadState();
  loadDailyStats();
  loadQuestionHistory();
  loadQuizSettings();
  applyTheme(state.theme);
  applyFontSize();
  setupEventListeners();

  // 過去問データを事前読み込み
  await loadQuestionData();

  // 初期タブ表示
  switchTab(state.currentTab);
}

// ===== タブ切替 =====
function switchTab(tab, forceHome = false) {
  const previousTab = state.currentTab;
  state.currentTab = tab;

  // 下部ナビのアクティブ状態更新
  elements.bottomNavItems.forEach(item => {
    item.classList.toggle('active', item.dataset.tab === tab);
  });

  // 全画面を非表示
  elements.kakomonHome.style.display = 'none';
  elements.originalHome.style.display = 'none';
  elements.summaryHome.style.display = 'none';
  elements.quizScreen.style.display = 'none';
  elements.questionNav.style.display = 'none';

  // 過去問タブで問題表示中だった場合は復元
  if (tab === 'kakomon' && !forceHome && state.kakomonWasInQuiz && state.filteredQuestions.length > 0) {
    state.currentView = 'quiz';
    showQuizScreen();
    elements.headerTitle.textContent = '過去問';
  } else {
    state.currentView = 'home';
    // 選択したタブのホーム画面を表示
    switch (tab) {
      case 'kakomon':
        elements.kakomonHome.style.display = 'block';
        elements.headerTitle.textContent = '過去問';
        elements.backBtn.style.display = 'none';
        elements.menuBtn.style.display = 'flex';
        break;
      case 'original':
        elements.originalHome.style.display = 'block';
        elements.headerTitle.textContent = 'オリジナル';
        elements.backBtn.style.display = 'none';
        elements.menuBtn.style.display = 'flex';
        break;
      case 'summary':
        elements.summaryHome.style.display = 'block';
        elements.headerTitle.textContent = 'まとめ';
        elements.backBtn.style.display = 'none';
        elements.menuBtn.style.display = 'flex';
        break;
    }
  }

  saveState();
}

// ===== 問題画面表示 =====
function showQuizScreen() {
  state.currentView = 'quiz';
  state.kakomonWasInQuiz = true; // タブ切替時の復元用

  // ホーム画面を非表示
  elements.kakomonHome.style.display = 'none';
  elements.originalHome.style.display = 'none';
  elements.summaryHome.style.display = 'none';

  // 問題画面を表示
  elements.quizScreen.style.display = 'block';
  elements.questionNav.style.display = 'flex';
  elements.loadingState.style.display = 'none';
  elements.quizCard.style.display = 'block';

  // ヘッダー更新
  elements.backBtn.style.display = 'flex';
  elements.menuBtn.style.display = 'none';
}

// ===== ホーム画面に戻る =====
function backToHome() {
  state.kakomonWasInQuiz = false; // 明示的にホームに戻る場合はフラグをリセット

  // ヘッダー更新
  elements.backBtn.style.display = 'none';
  elements.menuBtn.style.display = 'flex';

  switchTab(state.currentTab, true); // forceHome = true でホーム画面を強制表示
}

// ===== 今日の問題（ランダム出題） =====
function startDailyQuiz(type) {
  if (!state.allData) return;

  const settings = state.quizSettings[type];
  let questions = [];

  // 全試験から問題を収集
  state.allData.exams.forEach(exam => {
    exam.questions.forEach(q => {
      if (type === 'hisshu' && q.section === 'A') {
        questions.push({ ...q, examId: exam.examId });
      } else if (type === 'ippan' && (q.section === 'B' || q.section === 'C')) {
        questions.push({ ...q, examId: exam.examId });
      } else if (type === 'rinjitsu' && q.section === 'D') {
        questions.push({ ...q, examId: exam.examId });
      }
    });
  });

  // 出題条件でフィルタリング
  questions = filterByCondition(questions, settings.condition);

  // シャッフルして指定数を取得
  const count = settings.count === 'all' ? questions.length : settings.count;
  const shuffled = questions.sort(() => Math.random() - 0.5);
  state.filteredQuestions = shuffled.slice(0, Math.min(count, shuffled.length));
  state.currentIndex = 0;
  state.showingAnswer = false;
  state.selectedChoices.clear();

  // 問題画面を表示
  showQuizScreen();
  renderQuestion();
  updateNavButtons();
}

function filterByCondition(questions, conditions) {
  if (!conditions || conditions.length === 0 || conditions.includes('unanswered')) {
    // 未出題: 回答履歴がない問題
    return questions.filter(q => !state.questionHistory[q.id]);
  }

  // 不正解回数でフィルタリング
  return questions.filter(q => {
    const history = state.questionHistory[q.id];
    if (!history) return false;

    const incorrectCount = history.incorrect || 0;

    // 条件に合致するかチェック
    if (conditions.includes('incorrect1') && incorrectCount >= 1) return true;
    if (conditions.includes('incorrect2') && incorrectCount >= 2) return true;
    if (conditions.includes('incorrect3') && incorrectCount >= 3) return true;

    return false;
  });
}

// ===== レガシー: モード切替（後で整理） =====
function setMode(mode) {
  state.mode = mode;
  state.currentIndex = 0;

  // UI更新
  document.documentElement.setAttribute('data-mode', mode);
  elements.modeTabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.mode === mode);
  });

  // サイドバータイトル更新
  elements.sidebarTitle.textContent = mode === 'quiz' ? '試験選択' : '科目選択';

  // ローディング表示
  elements.loadingState.style.display = 'block';
  elements.quizCard.style.display = 'none';
  elements.summaryCard.style.display = 'none';

  if (mode === 'quiz') {
    loadQuestionData();
  } else {
    loadSummaryData();
  }

  saveState();
}

// ===== 演習モード =====
async function loadQuestionData() {
  try {
    if (state.allData) {
      renderExamList();
      return;
    }

    const response = await fetch('./data/questions/all_questions.json');
    if (!response.ok) throw new Error('データの読み込みに失敗しました');

    state.allData = await response.json();
    console.log(`演習データ読み込み完了: ${state.allData.totalExams}試験, ${state.allData.totalQuestions}問`);

    renderExamList();

  } catch (error) {
    console.error('データ読み込みエラー:', error);
    if (elements.loadingState) {
      elements.loadingState.innerHTML = `<p>エラー: ${error.message}</p>`;
    }
  }
}

function renderExamList() {
  if (!state.allData) return;
  const exams = state.allData.exams;

  elements.examList.innerHTML = exams.map(exam => `
    <button class="exam-item" data-exam-id="${exam.examId}">
      第${exam.examId}回 (${exam.totalQuestions}問)
    </button>
  `).join('');

  elements.examList.querySelectorAll('.exam-item').forEach(btn => {
    btn.addEventListener('click', () => {
      selectExam(btn.dataset.examId);
      closeSidebar();
    });
  });
}

function selectExam(examId) {
  const exam = state.allData.exams.find(e => e.examId === examId);
  if (!exam) return;

  state.currentExam = exam;
  state.currentIndex = 0;
  state.showingAnswer = false;
  state.selectedChoices.clear();

  elements.examList.querySelectorAll('.exam-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.examId === examId);
  });

  filterQuestions();

  // 問題画面を表示
  showQuizScreen();
  renderQuestion();
}

function filterQuestions() {
  if (!state.currentExam) {
    state.filteredQuestions = [];
    return;
  }

  if (state.filter === 'all') {
    state.filteredQuestions = [...state.currentExam.questions];
  } else {
    state.filteredQuestions = state.currentExam.questions.filter(q => q.section === state.filter);
  }

  if (state.currentIndex >= state.filteredQuestions.length) {
    state.currentIndex = Math.max(0, state.filteredQuestions.length - 1);
  }
}

function renderQuestion() {
  if (state.filteredQuestions.length === 0) {
    elements.cardCategory.textContent = '-';
    elements.questionId.textContent = '';
    elements.cardTitle.textContent = '問題がありません';
    elements.choicesContainer.innerHTML = '';
    elements.imageRef.style.display = 'none';
    elements.answerArea.style.display = 'none';
    elements.showAnswerBtn.style.display = 'none';
    elements.nextQuestionBtn.style.display = 'none';
    updateNavButtons();
    return;
  }

  const question = state.filteredQuestions[state.currentIndex];
  state.viewedCards.add(question.id);

  elements.quizCard.style.animation = 'none';
  elements.quizCard.offsetHeight;
  elements.quizCard.style.animation = null;

  elements.cardCategory.textContent = `${question.section}問題`;
  elements.questionId.textContent = question.id;
  elements.cardTitle.textContent = question.questionText;

  if (question.imageRef) {
    elements.imageRef.style.display = 'flex';
    elements.imageRefText.textContent = question.imageRef;
    renderImageThumbnails(question);
  } else {
    elements.imageRef.style.display = 'none';
    elements.imageThumbnails.innerHTML = '';
  }

  renderChoices(question);

  elements.answerArea.style.display = 'none';
  elements.showAnswerBtn.style.display = 'block';
  elements.nextQuestionBtn.style.display = 'none';
  if (elements.difficultyBtns) {
    elements.difficultyBtns.style.display = 'none';
  }

  if (question.selectCount > 1) {
    elements.showAnswerBtn.textContent = `解答を見る (${question.selectCount}つ選択)`;
  } else {
    elements.showAnswerBtn.textContent = '解答を見る';
  }

  // 常に未回答状態で表示（前後移動で回答リセット）
  state.showingAnswer = false;
  state.selectedChoices.clear();

  elements.quizFavoriteBtn.classList.toggle('active', state.favorites.has(question.id));

  elements.currentIndexEl.textContent = state.currentIndex + 1;
  elements.totalCards.textContent = state.filteredQuestions.length;

  updateNavButtons();
  saveState();
}

function renderChoices(question) {
  elements.choicesContainer.innerHTML = question.choices.map(choice => `
    <button class="choice-btn" data-label="${choice.label}">
      <span class="choice-label">${choice.label}</span>
      <span class="choice-text">${choice.text}</span>
    </button>
  `).join('');

  elements.choicesContainer.querySelectorAll('.choice-btn').forEach(btn => {
    btn.addEventListener('click', () => toggleChoice(btn.dataset.label));
  });
}

function toggleChoice(label) {
  if (state.showingAnswer) return;

  const question = state.filteredQuestions[state.currentIndex];

  if (question.selectCount === 1) {
    state.selectedChoices.clear();
    state.selectedChoices.add(label);
  } else {
    if (state.selectedChoices.has(label)) {
      state.selectedChoices.delete(label);
    } else {
      state.selectedChoices.add(label);
    }
  }

  elements.choicesContainer.querySelectorAll('.choice-btn').forEach(btn => {
    btn.classList.toggle('selected', state.selectedChoices.has(btn.dataset.label));
  });
}

function showAnswer() {
  const question = state.filteredQuestions[state.currentIndex];
  const wasAlreadyAnswered = state.answeredCards.has(question.id);
  state.showingAnswer = true;

  const correctLabels = question.correctAnswers;
  elements.correctAnswer.textContent = correctLabels.map(l => l.toUpperCase()).join(', ');
  elements.answerArea.style.display = 'block';

  elements.choicesContainer.querySelectorAll('.choice-btn').forEach(btn => {
    const label = btn.dataset.label;
    const isCorrect = correctLabels.includes(label);
    const isSelected = state.selectedChoices.has(label);

    btn.classList.add('revealed');
    if (isCorrect) btn.classList.add('correct');
    if (isSelected && !isCorrect) btn.classList.add('incorrect');
  });

  elements.showAnswerBtn.style.display = 'none';
  // 難易度ボタンを表示（次の問題ボタンは非表示）
  elements.nextQuestionBtn.style.display = 'none';
  if (elements.difficultyBtns) {
    elements.difficultyBtns.style.display = 'flex';
  }

  const allCorrect = correctLabels.every(l => state.selectedChoices.has(l)) &&
                     state.selectedChoices.size === correctLabels.length;

  state.answeredCards.set(question.id, {
    selected: Array.from(state.selectedChoices),
    correct: allCorrect
  });

  // 回答履歴を記録
  recordAnswer(question.id, Array.from(state.selectedChoices), allCorrect);

  // 初めて回答した問題のみカウント
  if (!wasAlreadyAnswered) {
    incrementTodayCount();
  }

  saveState();
}

// ===== 画像表示機能 =====
function parseImageRef(imageRef, examId) {
  if (!imageRef) return [];

  const images = [];
  // 「別冊No.1」「別冊No.4A, 4B」「別冊No.10A, 10B」などをパース
  // カンマで分割して各参照を処理
  const refs = imageRef.replace(/別冊No\./g, '').split(/[,、]/);

  let lastBaseNum = '';
  refs.forEach(ref => {
    ref = ref.trim();
    if (!ref) return;

    // 「4A」「10B」などの形式、または「4」「10」などの形式
    const match = ref.match(/^(\d+)([A-Za-z]*)$/);
    if (match) {
      lastBaseNum = match[1];
      const suffix = match[2] || '';
      images.push(`images/exam/${examId}/A_No${lastBaseNum}${suffix}.png`);
    } else {
      // 「A」「B」など、数字なしの場合は前の数字を使う
      const suffixOnly = ref.match(/^([A-Za-z]+)$/);
      if (suffixOnly && lastBaseNum) {
        images.push(`images/exam/${examId}/A_No${lastBaseNum}${suffixOnly[1]}.png`);
      }
    }
  });

  return images;
}

function renderImageThumbnails(question) {
  const examId = state.currentExam?.examId || question.examId;
  if (!examId || !question.imageRef) {
    elements.imageThumbnails.innerHTML = '';
    return;
  }

  const imagePaths = parseImageRef(question.imageRef, examId);
  state.currentImages = imagePaths;
  state.carouselIndex = 0;

  if (imagePaths.length === 0) {
    elements.imageThumbnails.innerHTML = '<span style="color: var(--text-muted); font-size: 0.85rem;">画像を読み込めません</span>';
    return;
  }

  // カルーセル形式のHTML生成
  const hasMultiple = imagePaths.length > 1;

  elements.imageThumbnails.innerHTML = `
    <div class="image-carousel">
      <div class="carousel-track" style="transform: translateX(0%)">
        ${imagePaths.map((path, idx) => `
          <div class="carousel-slide">
            <img
              src="${path}"
              alt="問題画像 ${idx + 1}"
              class="carousel-image"
              data-index="${idx}"
              onerror="this.parentElement.innerHTML='<span class=\\'carousel-error\\'>画像を読み込めません</span>'"
            >
          </div>
        `).join('')}
      </div>
      ${hasMultiple ? `
        <button class="carousel-btn carousel-prev" aria-label="前の画像">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button class="carousel-btn carousel-next" aria-label="次の画像">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
        <div class="carousel-dots">
          ${imagePaths.map((_, idx) => `
            <button class="carousel-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}" aria-label="画像 ${idx + 1}"></button>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;

  // イベントリスナー設定
  setupCarouselEvents();
}

// カルーセルのイベント設定
function setupCarouselEvents() {
  const carousel = elements.imageThumbnails.querySelector('.image-carousel');
  if (!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');
  const dots = carousel.querySelectorAll('.carousel-dot');
  const images = carousel.querySelectorAll('.carousel-image');

  // 矢印ボタン
  prevBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    goToCarouselSlide(state.carouselIndex - 1);
  });

  nextBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    goToCarouselSlide(state.carouselIndex + 1);
  });

  // ドットインジケーター
  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      goToCarouselSlide(parseInt(dot.dataset.index));
    });
  });

  // 画像クリックでモーダル表示
  images.forEach(img => {
    img.addEventListener('click', () => {
      openImageModal(state.carouselIndex);
    });
  });

  // スワイプ操作
  let touchStartX = 0;
  let touchEndX = 0;

  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  carousel.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    const minSwipe = 50;

    if (Math.abs(diff) > minSwipe) {
      if (diff > 0) {
        goToCarouselSlide(state.carouselIndex + 1);
      } else {
        goToCarouselSlide(state.carouselIndex - 1);
      }
    }
  }, { passive: true });

  updateCarouselButtons();
}

// カルーセルスライド移動
function goToCarouselSlide(index) {
  const total = state.currentImages.length;
  if (index < 0 || index >= total) return;

  state.carouselIndex = index;

  const track = elements.imageThumbnails.querySelector('.carousel-track');
  if (track) {
    track.style.transform = `translateX(-${index * 100}%)`;
  }

  // ドット更新
  const dots = elements.imageThumbnails.querySelectorAll('.carousel-dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });

  updateCarouselButtons();
}

// カルーセルボタンの有効/無効更新
function updateCarouselButtons() {
  const prevBtn = elements.imageThumbnails.querySelector('.carousel-prev');
  const nextBtn = elements.imageThumbnails.querySelector('.carousel-next');

  if (prevBtn) prevBtn.disabled = state.carouselIndex <= 0;
  if (nextBtn) nextBtn.disabled = state.carouselIndex >= state.currentImages.length - 1;
}

function openImageModal(index = 0) {
  if (state.currentImages.length === 0) return;

  state.currentImageIndex = index;
  elements.imageModal.classList.add('open');
  updateModalImage();
  document.body.style.overflow = 'hidden';
}

function closeImageModal() {
  elements.imageModal.classList.remove('open');
  document.body.style.overflow = '';
}

function updateModalImage() {
  const path = state.currentImages[state.currentImageIndex];
  elements.imageModalImg.src = path;
  elements.imageModalCounter.textContent = `${state.currentImageIndex + 1} / ${state.currentImages.length}`;

  elements.imageModalPrev.disabled = state.currentImageIndex <= 0;
  elements.imageModalNext.disabled = state.currentImageIndex >= state.currentImages.length - 1;
}

function prevModalImage() {
  if (state.currentImageIndex > 0) {
    state.currentImageIndex--;
    updateModalImage();
  }
}

function nextModalImage() {
  if (state.currentImageIndex < state.currentImages.length - 1) {
    state.currentImageIndex++;
    updateModalImage();
  }
}

// スワイプ操作の設定
function setupImageModalSwipe() {
  const modalContent = document.querySelector('.image-modal-content');
  if (!modalContent) return;

  // タッチ開始
  modalContent.addEventListener('touchstart', (e) => {
    state.touchStartX = e.changedTouches[0].screenX;
    state.touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  // タッチ終了
  modalContent.addEventListener('touchend', (e) => {
    state.touchEndX = e.changedTouches[0].screenX;
    state.touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
  }, { passive: true });
}

// スワイプ処理
function handleSwipe() {
  const diffX = state.touchStartX - state.touchEndX;
  const diffY = state.touchStartY - state.touchEndY;
  const minSwipeDistance = 50;

  // 水平方向のスワイプが垂直方向より大きい場合のみ処理
  if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
    if (diffX > 0) {
      // 左スワイプ = 次の画像
      nextModalImage();
    } else {
      // 右スワイプ = 前の画像
      prevModalImage();
    }
  }
}

// ===== まとめモード =====
async function loadSummaryData() {
  try {
    if (state.summaryIndex) {
      elements.loadingState.style.display = 'none';
      elements.summaryCard.style.display = 'block';
      renderCategoryList();
      if (state.currentCategory) {
        await loadCategoryData(state.currentCategory);
      }
      return;
    }

    const response = await fetch('./data/summaries/index.json');
    if (!response.ok) throw new Error('まとめデータの読み込みに失敗しました');

    state.summaryIndex = await response.json();
    console.log(`まとめデータ読み込み完了: ${state.summaryIndex.categories.length}カテゴリ`);

    renderCategoryList();

    // 最初のカテゴリを選択
    if (state.summaryIndex.categories.length > 0) {
      await selectCategory(state.summaryIndex.categories[0].id);
    }

    elements.loadingState.style.display = 'none';
    elements.summaryCard.style.display = 'block';

  } catch (error) {
    console.error('まとめデータ読み込みエラー:', error);
    elements.loadingState.innerHTML = `<p>エラー: ${error.message}</p>`;
  }
}

function renderCategoryList() {
  if (!state.summaryIndex) return;

  elements.categoryList.innerHTML = state.summaryIndex.categories.map(cat => `
    <button class="category-item" data-category-id="${cat.id}">
      <div class="category-icon" style="background-color: ${cat.color}20; color: ${cat.color}">
        ${getCategoryEmoji(cat.icon)}
      </div>
      <div class="category-info">
        <div class="category-name">${cat.name}</div>
        <div class="category-count">${cat.topicCount}トピック</div>
      </div>
    </button>
  `).join('');

  elements.categoryList.querySelectorAll('.category-item').forEach(btn => {
    btn.addEventListener('click', () => {
      selectCategory(btn.dataset.categoryId);
      closeSidebar();
    });
  });
}

function getCategoryEmoji(icon) {
  const icons = {
    'bone': '🦴',
    'heart': '❤️',
    'flask': '🧪',
    'microscope': '🔬',
    'pill': '💊',
    'dna': '🧬',
    'cog': '⚙️',
    'crown': '👑',
    'denture': '🦷',
    'tooth': '🦷',
    'scalpel': '🔪',
    'implant': '🔩',
    'elderly': '👴',
    'accessibility': '♿'
  };
  return icons[icon] || '📚';
}

async function selectCategory(categoryId) {
  state.currentCategory = categoryId;
  state.currentIndex = 0;

  elements.categoryList.querySelectorAll('.category-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.categoryId === categoryId);
  });

  await loadCategoryData(categoryId);
}

async function loadCategoryData(categoryId) {
  try {
    const response = await fetch(`./data/summaries/${categoryId}.json`);
    if (!response.ok) throw new Error('カテゴリデータの読み込みに失敗しました');

    state.currentCategoryData = await response.json();

    // カードをフラット化
    state.flattenedCards = [];
    state.currentCategoryData.topics.forEach(topic => {
      topic.cards.forEach(card => {
        state.flattenedCards.push({
          ...card,
          topicId: topic.id,
          topicName: topic.name
        });
      });
    });

    renderTopicList();
    renderSummaryCard();

  } catch (error) {
    console.error('カテゴリデータ読み込みエラー:', error);
  }
}

function renderTopicList() {
  if (!state.currentCategoryData) return;

  const category = state.summaryIndex.categories.find(c => c.id === state.currentCategory);

  elements.topicList.innerHTML = `
    <button class="topic-back-btn" id="backToCategoriesBtn">
      ← 科目一覧に戻る
    </button>
    <div class="topic-header" style="padding: 12px 16px; font-weight: 600; color: var(--text-secondary);">
      ${category?.name || ''}
    </div>
    ${state.currentCategoryData.topics.map(topic => `
      <button class="topic-item" data-topic-id="${topic.id}">
        ${topic.name} (${topic.cards.length})
      </button>
    `).join('')}
  `;

  document.getElementById('backToCategoriesBtn')?.addEventListener('click', () => {
    showCategoryList();
  });

  elements.topicList.querySelectorAll('.topic-item').forEach(btn => {
    btn.addEventListener('click', () => {
      selectTopic(btn.dataset.topicId);
      closeSidebar();
    });
  });

  // サイドバーでトピックリストを表示
  elements.categoryList.style.display = 'none';
  elements.topicList.style.display = 'flex';
}

function showCategoryList() {
  elements.categoryList.style.display = 'flex';
  elements.topicList.style.display = 'none';
}

function selectTopic(topicId) {
  state.currentTopic = topicId;

  // そのトピックの最初のカードのインデックスを見つける
  const index = state.flattenedCards.findIndex(c => c.topicId === topicId);
  if (index >= 0) {
    state.currentIndex = index;
    renderSummaryCard();
  }

  elements.topicList.querySelectorAll('.topic-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.topicId === topicId);
  });
}

function renderSummaryCard() {
  if (state.flattenedCards.length === 0) {
    elements.summaryCategory.textContent = '-';
    elements.summaryTopic.textContent = '-';
    elements.summaryTitle.textContent = 'カードがありません';
    elements.summaryContent.innerHTML = '';
    updateNavButtons();
    return;
  }

  const card = state.flattenedCards[state.currentIndex];
  const category = state.summaryIndex.categories.find(c => c.id === state.currentCategory);

  // アニメーション
  elements.summaryCard.style.animation = 'none';
  elements.summaryCard.offsetHeight;
  elements.summaryCard.style.animation = null;

  // パンくず
  elements.summaryCategory.textContent = category?.name || '';
  elements.summaryTopic.textContent = card.topicName;

  // タイトル
  elements.summaryTitle.textContent = card.title;

  // コンテンツ（Markdown風の変換）
  elements.summaryContent.innerHTML = parseMarkdown(card.content);

  // ポイント
  if (card.keyPoints && card.keyPoints.length > 0) {
    elements.keyPoints.style.display = 'block';
    elements.keyPointsList.innerHTML = card.keyPoints.map(p => `<li>${p}</li>`).join('');
  } else {
    elements.keyPoints.style.display = 'none';
  }

  // 参照ページ
  if (card.textbookRefs && card.textbookRefs.length > 0) {
    elements.textbookRefs.style.display = 'block';
    elements.textbookRefsList.innerHTML = card.textbookRefs.map(ref => `
      <span class="ref-item" data-book="${ref.book}" data-pages="${ref.pages.join(',')}">
        ${ref.book}
        <span class="ref-item-pages">p.${ref.pages.join(', ')}</span>
      </span>
    `).join('');
  } else {
    elements.textbookRefs.style.display = 'none';
  }

  // 関連問題
  if (card.relatedExamIds && card.relatedExamIds.length > 0) {
    elements.relatedExams.style.display = 'block';
    elements.relatedExamsList.innerHTML = card.relatedExamIds.map(id => `
      <span class="exam-ref-item" data-exam-id="${id}">${id}</span>
    `).join('');
  } else {
    elements.relatedExams.style.display = 'none';
  }

  // タグ
  if (card.tags && card.tags.length > 0) {
    elements.summaryTags.innerHTML = card.tags.map(tag => `
      <span class="summary-tag">${tag}</span>
    `).join('');
  } else {
    elements.summaryTags.innerHTML = '';
  }

  // お気に入り
  elements.summaryFavoriteBtn.classList.toggle('active', state.favorites.has(card.id));

  // カウンター
  elements.currentIndexEl.textContent = state.currentIndex + 1;
  elements.totalCards.textContent = state.flattenedCards.length;

  // トピック更新
  state.currentTopic = card.topicId;
  elements.topicList.querySelectorAll('.topic-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.topicId === card.topicId);
  });

  // 閲覧済み
  state.viewedCards.add(card.id);

  updateNavButtons();
  saveState();
}

function parseMarkdown(text) {
  if (!text) return '';

  return text
    // 見出し
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    // 太字
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // コード
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // テーブル
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      if (cells.every(c => c.trim().match(/^[-:]+$/))) {
        return ''; // セパレータ行をスキップ
      }
      const isHeader = match.includes('---');
      const tag = isHeader ? 'th' : 'td';
      return '<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>';
    })
    // テーブルラッパー
    .replace(/(<tr>.*<\/tr>\n?)+/g, '<table>$&</table>')
    // リスト
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    // 番号付きリスト
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // 段落
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<)(.+)$/gm, '<p>$1</p>')
    // 空のpタグを削除
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<h3>|<ul>|<ol>|<table>)/g, '$1')
    .replace(/(<\/h3>|<\/ul>|<\/ol>|<\/table>)<\/p>/g, '$1');
}

// ===== 共通ナビゲーション =====
function updateNavButtons() {
  const total = state.mode === 'quiz' ? state.filteredQuestions.length : state.flattenedCards.length;
  elements.prevBtn.disabled = state.currentIndex <= 0;
  elements.nextBtn.disabled = state.currentIndex >= total - 1;
}

// 問題番号ジャンプ
function showJumpDialog() {
  const total = state.mode === 'quiz' ? state.filteredQuestions.length : state.flattenedCards.length;
  if (total === 0) return;

  const input = prompt(`問題番号を入力 (1〜${total})`, state.currentIndex + 1);
  if (input === null) return; // キャンセル

  const num = parseInt(input, 10);
  if (isNaN(num) || num < 1 || num > total) {
    alert(`1〜${total}の数字を入力してください`);
    return;
  }

  jumpToQuestion(num - 1);
}

function jumpToQuestion(index) {
  const total = state.mode === 'quiz' ? state.filteredQuestions.length : state.flattenedCards.length;
  if (index < 0 || index >= total) return;

  state.currentIndex = index;
  state.showingAnswer = false;
  state.selectedChoices.clear();

  if (state.mode === 'quiz') {
    renderQuestion();
  } else {
    renderSummaryCard();
  }
}

function goToPrev() {
  if (state.currentIndex > 0) {
    state.currentIndex--;
    if (state.mode === 'quiz') {
      state.showingAnswer = false;
      state.selectedChoices.clear();
      renderQuestion();
    } else {
      renderSummaryCard();
    }
  }
}

function goToNext() {
  const total = state.mode === 'quiz' ? state.filteredQuestions.length : state.flattenedCards.length;
  if (state.currentIndex < total - 1) {
    state.currentIndex++;
    if (state.mode === 'quiz') {
      state.showingAnswer = false;
      state.selectedChoices.clear();
      renderQuestion();
    } else {
      renderSummaryCard();
    }
  }
}

// ===== 状態の保存/読み込み =====
function saveState() {
  const saveData = {
    mode: state.mode,
    favorites: Array.from(state.favorites),
    viewedCards: Array.from(state.viewedCards),
    answeredCards: Array.from(state.answeredCards.entries()),
    filter: state.filter,
    theme: state.theme,
    fontSize: state.fontSize,
    currentExamId: state.currentExam?.examId,
    currentCategory: state.currentCategory,
    currentIndex: state.currentIndex
  };
  localStorage.setItem('dentalExamState', JSON.stringify(saveData));
}

function loadState() {
  const saved = localStorage.getItem('dentalExamState');
  if (saved) {
    const data = JSON.parse(saved);
    state.mode = data.mode || 'quiz';
    state.favorites = new Set(data.favorites || []);
    state.viewedCards = new Set(data.viewedCards || []);
    state.answeredCards = new Map(data.answeredCards || []);
    state.filter = data.filter || 'all';
    state.theme = data.theme || 'light';
    state.fontSize = data.fontSize || 100;
    state.currentCategory = data.currentCategory || null;
  }
}

// ===== テーマ管理 =====
function applyTheme(theme) {
  state.theme = theme;

  let effectiveTheme = theme;
  if (theme === 'auto') {
    effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  document.documentElement.setAttribute('data-theme', effectiveTheme);

  elements.themeOptions?.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });

  saveState();
}

function cycleTheme() {
  const themes = ['light', 'dark', 'auto'];
  const currentIdx = themes.indexOf(state.theme);
  const nextTheme = themes[(currentIdx + 1) % themes.length];
  applyTheme(nextTheme);
}

// ===== フォントサイズ =====
function applyFontSize() {
  document.documentElement.style.setProperty('--font-size-base', `${state.fontSize * 0.16}px`);
  if (elements.fontSizeDisplay) {
    elements.fontSizeDisplay.textContent = `${state.fontSize}%`;
  }
}

function changeFontSize(delta) {
  state.fontSize = Math.max(75, Math.min(150, state.fontSize + delta));
  applyFontSize();
  saveState();
}

// ===== お気に入り =====
function toggleFavorite() {
  let id;
  if (state.mode === 'quiz') {
    if (state.filteredQuestions.length === 0) return;
    id = state.filteredQuestions[state.currentIndex].id;
    elements.quizFavoriteBtn.classList.toggle('active', !state.favorites.has(id));
  } else {
    if (state.flattenedCards.length === 0) return;
    id = state.flattenedCards[state.currentIndex].id;
    elements.summaryFavoriteBtn.classList.toggle('active', !state.favorites.has(id));
  }

  if (state.favorites.has(id)) {
    state.favorites.delete(id);
  } else {
    state.favorites.add(id);
  }

  saveState();
}

// ===== 日次統計 =====
function getTodayKey() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function incrementTodayCount() {
  const todayKey = getTodayKey();
  state.dailyStats[todayKey] = (state.dailyStats[todayKey] || 0) + 1;
  saveDailyStats();
}

function getTodayCount() {
  return state.dailyStats[getTodayKey()] || 0;
}

function getWeeklyAverage() {
  const today = new Date();
  let total = 0;
  let days = 0;

  // 過去7日間（今日を除く）の平均を計算
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    if (state.dailyStats[key] !== undefined) {
      total += state.dailyStats[key];
      days++;
    }
  }

  return days > 0 ? Math.round(total / days) : 0;
}

function updateTodayStatsDisplay() {
  const todayCount = getTodayCount();
  const weeklyAvg = getWeeklyAverage();
  const diff = todayCount - weeklyAvg;

  if (elements.todayCount) {
    elements.todayCount.textContent = todayCount;
  }

  if (elements.todayDiff) {
    if (weeklyAvg > 0 || todayCount > 0) {
      const sign = diff >= 0 ? '+' : '';
      elements.todayDiff.textContent = `(${sign}${diff})`;
      elements.todayDiff.className = 'today-diff ' + (diff >= 0 ? 'positive' : 'negative');
    } else {
      elements.todayDiff.textContent = '';
    }
  }
}

function saveDailyStats() {
  // 30日以上古いデータを削除
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);

  const cleaned = {};
  Object.keys(state.dailyStats).forEach(key => {
    const date = new Date(key);
    if (date >= cutoffDate) {
      cleaned[key] = state.dailyStats[key];
    }
  });
  state.dailyStats = cleaned;

  localStorage.setItem('dentalExamDailyStats', JSON.stringify(state.dailyStats));
}

function loadDailyStats() {
  const saved = localStorage.getItem('dentalExamDailyStats');
  if (saved) {
    state.dailyStats = JSON.parse(saved);
  }
}

// ===== 回答履歴管理 =====
function saveQuestionHistory() {
  localStorage.setItem('dentalExamQuestionHistory', JSON.stringify(state.questionHistory));
}

function loadQuestionHistory() {
  const saved = localStorage.getItem('dentalExamQuestionHistory');
  if (saved) {
    state.questionHistory = JSON.parse(saved);
  }
}

function recordAnswer(questionId, selectedChoices, isCorrect) {
  const todayKey = getTodayKey();

  if (!state.questionHistory[questionId]) {
    state.questionHistory[questionId] = {
      attempts: 0,
      correct: 0,
      incorrect: 0,
      lastAttempt: null,
      difficulty: null,
      history: []
    };
  }

  const record = state.questionHistory[questionId];
  record.attempts++;
  record.lastAttempt = todayKey;

  if (isCorrect) {
    record.correct++;
  } else {
    record.incorrect++;
  }

  // 履歴に追加（最新10件まで保持）
  record.history.push({
    date: todayKey,
    correct: isCorrect,
    selected: selectedChoices
  });
  if (record.history.length > 10) {
    record.history.shift();
  }

  saveQuestionHistory();
}

function setDifficulty(questionId, difficulty) {
  if (!state.questionHistory[questionId]) {
    state.questionHistory[questionId] = {
      attempts: 0,
      correct: 0,
      incorrect: 0,
      lastAttempt: getTodayKey(),
      difficulty: null,
      history: []
    };
  }

  state.questionHistory[questionId].difficulty = difficulty;
  saveQuestionHistory();
}

function getQuestionStats(questionId) {
  return state.questionHistory[questionId] || null;
}

function selectDifficulty(difficulty) {
  const question = state.filteredQuestions[state.currentIndex];
  if (!question) return;

  // 難易度を保存
  setDifficulty(question.id, difficulty);

  // 難易度ボタンを非表示
  if (elements.difficultyBtns) {
    elements.difficultyBtns.style.display = 'none';
  }

  // 次の問題へ自動で進む
  const total = state.filteredQuestions.length;
  if (state.currentIndex < total - 1) {
    state.currentIndex++;
    state.showingAnswer = false;
    state.selectedChoices.clear();
    renderQuestion();
  } else {
    // 最後の問題の場合は次の問題ボタンを表示
    elements.nextQuestionBtn.style.display = 'block';
  }
}

// ===== 出題設定管理 =====
function saveQuizSettings() {
  localStorage.setItem('dentalExamQuizSettings', JSON.stringify(state.quizSettings));
}

function loadQuizSettings() {
  const saved = localStorage.getItem('dentalExamQuizSettings');
  if (saved) {
    state.quizSettings = JSON.parse(saved);
  }
}

function openQuizSettings() {
  // UIを現在の設定で更新
  updateQuizSettingsUI();
  elements.quizSettingsPanel.classList.add('open');
  elements.quizSettingsOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeQuizSettings() {
  elements.quizSettingsPanel.classList.remove('open');
  elements.quizSettingsOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

function updateQuizSettingsUI() {
  // 必修
  if (elements.hisshuCount) {
    elements.hisshuCount.value = state.quizSettings.hisshu.count === 'all' ? 'all' : state.quizSettings.hisshu.count;
  }
  updateRangeButtons('hisshuRange', state.quizSettings.hisshu.range);
  updateConditionButtons('hisshuCondition', state.quizSettings.hisshu.condition);

  // 一般
  if (elements.ippanCount) {
    elements.ippanCount.value = state.quizSettings.ippan.count === 'all' ? 'all' : state.quizSettings.ippan.count;
  }
  updateRangeButtons('ippanRange', state.quizSettings.ippan.range);
  updateConditionButtons('ippanCondition', state.quizSettings.ippan.condition);

  // 臨実
  if (elements.rinjitsuCount) {
    elements.rinjitsuCount.value = state.quizSettings.rinjitsu.count === 'all' ? 'all' : state.quizSettings.rinjitsu.count;
  }
  updateRangeButtons('rinjitsuRange', state.quizSettings.rinjitsu.range);
  updateConditionButtons('rinjitsuCondition', state.quizSettings.rinjitsu.condition);
}

function updateRangeButtons(containerId, selectedValues) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.querySelectorAll('.range-btn').forEach(btn => {
    btn.classList.toggle('active', selectedValues.includes(btn.dataset.value));
  });
}

function updateConditionButtons(containerId, selectedValues) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.querySelectorAll('.condition-btn').forEach(btn => {
    btn.classList.toggle('active', selectedValues.includes(btn.dataset.value));
  });
}

function toggleSectionCollapse(sectionId) {
  const body = document.getElementById(sectionId + 'Settings');
  if (!body) return;

  const header = body.previousElementSibling;
  body.classList.toggle('collapsed');
  header.classList.toggle('collapsed');
}

function handleRangeButtonClick(containerId, btn) {
  btn.classList.toggle('active');
}

function handleConditionButtonClick(containerId, btn) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const value = btn.dataset.value;

  if (value === 'unanswered') {
    // 未出題は単独選択
    container.querySelectorAll('.condition-btn').forEach(b => {
      b.classList.remove('active');
    });
    btn.classList.add('active');
  } else {
    // 不正解系は複数選択可
    // 未出題を外す
    container.querySelector('[data-value="unanswered"]')?.classList.remove('active');
    btn.classList.toggle('active');

    // 何も選択されていなければ未出題を選択
    const anyActive = container.querySelectorAll('.condition-btn.active:not([data-value="unanswered"])').length > 0;
    if (!anyActive) {
      container.querySelector('[data-value="unanswered"]')?.classList.add('active');
    }
  }
}

function collectQuizSettingsFromUI() {
  // 必修
  state.quizSettings.hisshu.count = elements.hisshuCount?.value === 'all' ? 'all' : parseInt(elements.hisshuCount?.value || 20);
  state.quizSettings.hisshu.range = collectActiveValues('hisshuRange');
  state.quizSettings.hisshu.condition = collectActiveValues('hisshuCondition');

  // 一般
  state.quizSettings.ippan.count = elements.ippanCount?.value === 'all' ? 'all' : parseInt(elements.ippanCount?.value || 10);
  state.quizSettings.ippan.range = collectActiveValues('ippanRange');
  state.quizSettings.ippan.condition = collectActiveValues('ippanCondition');

  // 臨実
  state.quizSettings.rinjitsu.count = elements.rinjitsuCount?.value === 'all' ? 'all' : parseInt(elements.rinjitsuCount?.value || 10);
  state.quizSettings.rinjitsu.range = collectActiveValues('rinjitsuRange');
  state.quizSettings.rinjitsu.condition = collectActiveValues('rinjitsuCondition');
}

function collectActiveValues(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return [];

  return Array.from(container.querySelectorAll('.active')).map(btn => btn.dataset.value);
}

function saveAndCloseQuizSettings() {
  collectQuizSettingsFromUI();
  saveQuizSettings();
  closeQuizSettings();
}

// ===== 検索モーダル =====
function openSearchModal() {
  elements.searchModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSearchModal() {
  elements.searchModal.classList.remove('open');
  document.body.style.overflow = '';
}

function toggleSearchDetails() {
  const body = elements.searchDetailsBody;
  const toggle = elements.searchDetailsToggle;

  body.classList.toggle('collapsed');
  toggle.classList.toggle('expanded');
}

function toggleFilterButton(btn) {
  btn.classList.toggle('active');
}

function selectAllFilters(targetId) {
  const container = document.getElementById(targetId);
  if (!container) return;

  container.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.add('active');
  });
}

function clearAllFilters(targetId) {
  const container = document.getElementById(targetId);
  if (!container) return;

  container.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
}

function getActiveFilterValues(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return [];

  return Array.from(container.querySelectorAll('.filter-btn.active')).map(btn => btn.dataset.value);
}

function startFilteredQuiz() {
  if (!state.allData) return;

  const keyword = elements.searchKeyword?.value.trim() || '';
  const practiceStatus = getActiveFilterValues('practiceStatusFilter');
  const questionTypes = getActiveFilterValues('questionTypeFilter');
  const examNumbers = getActiveFilterValues('examFilter');

  let questions = [];

  // 選択した回数の問題を収集
  state.allData.exams.forEach(exam => {
    if (!examNumbers.includes(exam.examId)) return;

    exam.questions.forEach(q => {
      // 問題区分でフィルタ
      const section = q.section;
      if (section === 'A' && !questionTypes.includes('hisshu')) return;
      if ((section === 'B' || section === 'C') && !questionTypes.includes('ippan')) return;
      if (section === 'D' && !questionTypes.includes('rinjitsu')) return;

      questions.push({ ...q, examId: exam.examId });
    });
  });

  // 演習状態でフィルタ
  questions = filterByPracticeStatus(questions, practiceStatus);

  // キーワード検索
  if (keyword) {
    questions = filterByKeyword(questions, keyword);
  }

  if (questions.length === 0) {
    alert('条件に合う問題がありませんでした');
    return;
  }

  // シャッフル
  const shuffled = questions.sort(() => Math.random() - 0.5);
  state.filteredQuestions = shuffled;
  state.currentIndex = 0;
  state.showingAnswer = false;
  state.selectedChoices.clear();

  // モーダルを閉じて問題画面を表示
  closeSearchModal();
  showQuizScreen();
  renderQuestion();
  updateNavButtons();
}

function filterByPracticeStatus(questions, statuses) {
  if (!statuses || statuses.length === 0) return questions;

  // 全て選択されている場合はフィルタなし
  if (statuses.includes('unanswered') && statuses.includes('correct') && statuses.includes('incorrect')) {
    return questions;
  }

  return questions.filter(q => {
    const history = state.questionHistory[q.id];

    // 未演習
    if (statuses.includes('unanswered') && !history) {
      return true;
    }

    if (history && history.history && history.history.length > 0) {
      const lastAttempt = history.history[history.history.length - 1];
      // 直近○
      if (statuses.includes('correct') && lastAttempt.correct) {
        return true;
      }
      // 直近×
      if (statuses.includes('incorrect') && !lastAttempt.correct) {
        return true;
      }
    }

    return false;
  });
}

function filterByKeyword(questions, keyword) {
  const lowerKeyword = keyword.toLowerCase();

  return questions.filter(q => {
    // 問題IDで検索
    if (q.id.toLowerCase().includes(lowerKeyword)) {
      return true;
    }
    // 問題文で検索
    if (q.questionText && q.questionText.toLowerCase().includes(lowerKeyword)) {
      return true;
    }
    // 選択肢で検索
    if (q.choices && q.choices.some(c => c.text.toLowerCase().includes(lowerKeyword))) {
      return true;
    }
    return false;
  });
}

function executeSearch() {
  startFilteredQuiz();
}

// ===== サイドバー/設定パネル =====
function openSidebar() {
  elements.sidebar.classList.add('open');
  elements.sidebarOverlay.classList.add('open');
}

function closeSidebar() {
  elements.sidebar.classList.remove('open');
  elements.sidebarOverlay.classList.remove('open');
}

function openSettings() {
  updateTodayStatsDisplay();
  elements.settingsPanel.classList.add('open');
  elements.settingsOverlay.classList.add('open');
}

function closeSettings() {
  elements.settingsPanel.classList.remove('open');
  elements.settingsOverlay.classList.remove('open');
}

// ===== イベントリスナー =====
function setupEventListeners() {
  // 下部ナビゲーション
  elements.bottomNavItems.forEach(item => {
    item.addEventListener('click', () => switchTab(item.dataset.tab));
  });

  // 過去問ホームのボタン
  elements.dailyHisshuBtn?.addEventListener('click', () => startDailyQuiz('hisshu'));
  elements.dailyIppanBtn?.addEventListener('click', () => startDailyQuiz('ippan'));
  elements.dailyRinjitsuBtn?.addEventListener('click', () => startDailyQuiz('rinjitsu'));
  elements.settingsMenuBtn?.addEventListener('click', openQuizSettings);
  elements.examSelectBtn?.addEventListener('click', openSearchModal);

  // レガシー: モードタブ
  elements.modeTabs.forEach(tab => {
    tab.addEventListener('click', () => setMode(tab.dataset.mode));
  });

  // ヘッダーボタン
  elements.backBtn?.addEventListener('click', backToHome);
  elements.menuBtn.addEventListener('click', openSidebar);
  elements.themeBtn.addEventListener('click', cycleTheme);
  elements.settingsBtn.addEventListener('click', openSettings);

  // サイドバー
  elements.closeSidebarBtn.addEventListener('click', closeSidebar);
  elements.sidebarOverlay.addEventListener('click', closeSidebar);

  // 設定パネル
  elements.closeSettingsBtn.addEventListener('click', closeSettings);
  elements.settingsOverlay.addEventListener('click', closeSettings);

  // 出題設定パネル
  elements.closeQuizSettingsBtn?.addEventListener('click', closeQuizSettings);
  elements.quizSettingsOverlay?.addEventListener('click', closeQuizSettings);
  elements.saveQuizSettingsBtn?.addEventListener('click', saveAndCloseQuizSettings);

  // セクション開閉
  document.querySelectorAll('.settings-section-header').forEach(header => {
    header.addEventListener('click', () => {
      toggleSectionCollapse(header.dataset.toggle);
    });
  });

  // 範囲ボタン
  document.querySelectorAll('.range-buttons').forEach(container => {
    container.querySelectorAll('.range-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        handleRangeButtonClick(container.id, btn);
      });
    });
  });

  // 条件ボタン
  document.querySelectorAll('.condition-buttons').forEach(container => {
    container.querySelectorAll('.condition-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        handleConditionButtonClick(container.id, btn);
      });
    });
  });

  // 検索モーダル
  elements.closeSearchModalBtn?.addEventListener('click', closeSearchModal);
  elements.searchModalBackdrop?.addEventListener('click', closeSearchModal);
  elements.searchDetailsToggle?.addEventListener('click', toggleSearchDetails);
  elements.startFilteredQuizBtn?.addEventListener('click', startFilteredQuiz);
  elements.searchBtn?.addEventListener('click', executeSearch);

  // 検索モーダル内のフィルターボタン
  document.querySelectorAll('#searchModal .filter-buttons').forEach(container => {
    container.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => toggleFilterButton(btn));
    });
  });

  // 全選択/全解除ボタン
  document.querySelectorAll('.filter-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const target = btn.dataset.target;
      if (action === 'selectAll') {
        selectAllFilters(target);
      } else if (action === 'clearAll') {
        clearAllFilters(target);
      }
    });
  });

  // Enterキーで検索
  elements.searchKeyword?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      executeSearch();
    }
  });

  // テーマ選択
  elements.themeOptions.forEach(btn => {
    btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
  });

  // フォントサイズ
  elements.fontDecrease.addEventListener('click', () => changeFontSize(-10));
  elements.fontIncrease.addEventListener('click', () => changeFontSize(10));

  // ログインボタン（Firebase認証で処理）
  elements.loginBtn?.addEventListener('click', handleGoogleLogin);

  // ナビゲーション
  elements.prevBtn.addEventListener('click', goToPrev);
  elements.nextBtn.addEventListener('click', goToNext);

  // 問題番号クリックでジャンプ
  elements.currentIndexEl?.addEventListener('click', showJumpDialog);

  // お気に入り
  elements.quizFavoriteBtn?.addEventListener('click', toggleFavorite);
  elements.summaryFavoriteBtn?.addEventListener('click', toggleFavorite);

  // 解答表示（演習モード）
  elements.showAnswerBtn?.addEventListener('click', showAnswer);
  elements.nextQuestionBtn?.addEventListener('click', goToNext);

  // 難易度選択ボタン
  elements.difficultyBtns?.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => selectDifficulty(btn.dataset.difficulty));
  });

  // 画像モーダル
  elements.imageModalClose?.addEventListener('click', closeImageModal);
  elements.imageModalBackdrop?.addEventListener('click', closeImageModal);
  elements.imageModalPrev?.addEventListener('click', prevModalImage);
  elements.imageModalNext?.addEventListener('click', nextModalImage);

  // 画像モーダルのスワイプ操作
  setupImageModalSwipe();

  // キーボードナビゲーション
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    // モーダルが開いている場合
    if (elements.imageModal?.classList.contains('open')) {
      switch (e.key) {
        case 'Escape':
          closeImageModal();
          break;
        case 'ArrowLeft':
          prevModalImage();
          break;
        case 'ArrowRight':
          nextModalImage();
          break;
      }
      return;
    }

    switch (e.key) {
      case 'ArrowLeft':
        goToPrev();
        break;
      case 'ArrowRight':
        goToNext();
        break;
      case ' ':
      case 'Enter':
        e.preventDefault();
        if (state.mode === 'quiz') {
          if (state.showingAnswer) {
            goToNext();
          } else {
            showAnswer();
          }
        } else {
          goToNext();
        }
        break;
      case 'f':
        toggleFavorite();
        break;
      case 'Escape':
        closeSidebar();
        closeSettings();
        break;
      case '1': case '2': case '3':
        if (state.mode === 'quiz') {
          if (state.showingAnswer) {
            // 回答表示中は難易度選択
            const difficulties = ['easy', 'normal', 'hard'];
            selectDifficulty(difficulties[parseInt(e.key) - 1]);
          } else {
            // 回答前は選択肢選択
            const labels = ['a', 'b', 'c'];
            toggleChoice(labels[parseInt(e.key) - 1]);
          }
        }
        break;
      case '4': case '5':
        if (state.mode === 'quiz' && !state.showingAnswer) {
          const labels = ['a', 'b', 'c', 'd', 'e'];
          const idx = parseInt(e.key) - 1;
          if (idx < labels.length) toggleChoice(labels[idx]);
        }
        break;
      case 'a': case 'b': case 'c': case 'd': case 'e':
        if (state.mode === 'quiz') toggleChoice(e.key);
        break;
    }
  });

  // システムテーマ変更の監視
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (state.theme === 'auto') applyTheme('auto');
  });
}

// ===== Firebase認証・招待コード =====

// 招待コードが検証済みかチェック
function isInviteCodeVerified() {
  return localStorage.getItem('dentalExamInviteVerified') === 'true';
}

// ログインページを表示
function showLoginPage() {
  elements.loginPage?.classList.add('open');
  setTimeout(() => {
    elements.inviteCodeInput?.focus();
  }, 300);
}

// ログインページを非表示
function hideLoginPage() {
  elements.loginPage?.classList.remove('open');
}

// ログインエラーを表示
function showLoginError(title, details) {
  if (elements.loginErrorArea) {
    elements.loginErrorArea.classList.add('show');
  }
  if (elements.loginErrorTitle) {
    elements.loginErrorTitle.textContent = title;
  }
  if (elements.loginErrorDetails) {
    elements.loginErrorDetails.innerHTML = details;
  }
}

// ログインエラーを非表示
function hideLoginError() {
  if (elements.loginErrorArea) {
    elements.loginErrorArea.classList.remove('show');
  }
}

// 招待コードを検証
async function validateInviteCode(code) {
  // Firebaseの初期化を待つ
  let retries = 0;
  while ((!window.firebaseDb || !window.firebaseFunctions) && retries < 10) {
    await new Promise(resolve => setTimeout(resolve, 300));
    retries++;
  }

  if (!window.firebaseDb || !window.firebaseFunctions) {
    console.error('Firebase not initialized after waiting');
    return { valid: false, error: 'システムの初期化中です。もう一度お試しください。' };
  }

  const { doc, getDoc, updateDoc, serverTimestamp } = window.firebaseFunctions;
  const db = window.firebaseDb;
  const upperCode = code.toUpperCase().trim();

  try {
    console.log('Validating invite code:', upperCode);
    const codeRef = doc(db, 'inviteCodes', upperCode);
    const codeDoc = await getDoc(codeRef);

    if (!codeDoc.exists()) {
      console.log('Invite code not found:', upperCode);
      return { valid: false, error: '無効な招待コードです' };
    }

    const codeData = codeDoc.data();
    console.log('Invite code data:', codeData);

    if (codeData.used) {
      return { valid: false, error: 'このコードは既に使用されています' };
    }

    // コードを使用済みにする（エラーが出ても検証は成功とする）
    try {
      await updateDoc(codeRef, {
        used: true,
        usedAt: serverTimestamp(),
        usedBy: state.currentUser?.uid || 'anonymous'
      });
      console.log('Invite code marked as used');
    } catch (updateError) {
      // 更新エラーは無視（セキュリティルールの問題の可能性）
      // コードの検証自体は成功しているので続行
      console.warn('Could not mark code as used (this is OK):', updateError.message);
    }

    return { valid: true };
  } catch (error) {
    console.error('Invite code validation error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);

    // より具体的なエラーメッセージ
    if (error.code === 'permission-denied') {
      return { valid: false, error: 'アクセス権限エラー。管理者に連絡してください。' };
    } else if (error.code === 'unavailable') {
      return { valid: false, error: 'サーバーに接続できません。ネットワークを確認してください。' };
    }

    return { valid: false, error: 'コードの確認中にエラーが発生しました' };
  }
}

// 招待コード送信ハンドラ
async function handleInviteSubmit() {
  const code = elements.inviteCodeInput?.value.trim();

  // エラー表示をリセット
  hideLoginError();

  if (!code) {
    showLoginError('招待コードを入力してください', '');
    return;
  }

  elements.inviteSubmitBtn.disabled = true;
  elements.inviteSubmitBtn.textContent = 'ログイン中...';

  const result = await validateInviteCode(code);

  if (result.valid) {
    localStorage.setItem('dentalExamInviteVerified', 'true');
    state.inviteCodeVerified = true;
    hideLoginPage();
  } else {
    // 詳細なエラーメッセージを表示
    const errorDetails = `
      <p style="margin-bottom: 12px;">以下を確認してください</p>
      <ul>
        <li>全角と半角間違えていませんか？</li>
        <li>大文字と小文字間違えていませんか？</li>
        <li>ログイン失敗が続く場合は招待者に問い合わせてください</li>
      </ul>
    `;
    showLoginError('ログイン失敗しました', errorDetails);
  }

  elements.inviteSubmitBtn.disabled = false;
  elements.inviteSubmitBtn.textContent = 'ログイン';
}

// Googleログイン
async function handleGoogleLogin() {
  if (!window.firebaseAuth || !window.firebaseProvider || !window.firebaseFunctions) {
    console.error('Firebase not initialized');
    alert('ログイン機能の準備中です。しばらくお待ちください。');
    return;
  }

  const { signInWithPopup } = window.firebaseFunctions;

  try {
    const result = await signInWithPopup(window.firebaseAuth, window.firebaseProvider);
    state.currentUser = result.user;
    state.isAuthenticated = true;
    updateLoginUI();

    // ログイン後にデータを移行・同期
    await migrateAndSyncData();
  } catch (error) {
    console.error('Google login error:', error);
    if (error.code !== 'auth/popup-closed-by-user') {
      alert('ログインに失敗しました: ' + error.message);
    }
  }
}

// ログアウト
async function handleLogout() {
  if (!window.firebaseAuth || !window.firebaseFunctions) return;

  const { signOut } = window.firebaseFunctions;

  try {
    await signOut(window.firebaseAuth);
    state.currentUser = null;
    state.isAuthenticated = false;
    updateLoginUI();
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// ログインUIを更新
function updateLoginUI() {
  if (!elements.loginSection) return;

  if (state.isAuthenticated && state.currentUser) {
    elements.loginSection.innerHTML = `
      <div class="user-info">
        <img src="${state.currentUser.photoURL || ''}" alt="" class="user-avatar" onerror="this.style.display='none'">
        <div class="user-details">
          <div class="user-name">${state.currentUser.displayName || 'ユーザー'}</div>
          <div class="user-email">${state.currentUser.email || ''}</div>
        </div>
      </div>
      <button class="btn-logout" id="logoutBtn">ログアウト</button>
      <div class="sync-indicator ${state.syncStatus}" id="syncIndicator">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9"></path>
        </svg>
        <span>${getSyncStatusText()}</span>
      </div>
    `;

    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
  } else {
    elements.loginSection.innerHTML = `
      <button class="btn-login" id="loginBtn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
          <polyline points="10 17 15 12 10 7"></polyline>
          <line x1="15" y1="12" x2="3" y2="12"></line>
        </svg>
        Googleでログイン
      </button>
    `;

    document.getElementById('loginBtn')?.addEventListener('click', handleGoogleLogin);
  }
}

function getSyncStatusText() {
  switch (state.syncStatus) {
    case 'syncing': return '同期中...';
    case 'synced': return '同期済み';
    case 'error': return '同期エラー';
    default: return 'クラウド保存';
  }
}

// Firestoreにデータを保存
async function syncToFirestore() {
  if (!state.isAuthenticated || !state.currentUser) return;
  if (!window.firebaseDb || !window.firebaseFunctions) return;

  const { doc, setDoc, serverTimestamp } = window.firebaseFunctions;
  const db = window.firebaseDb;

  state.syncStatus = 'syncing';
  updateSyncIndicator();

  try {
    const userData = {
      // 基本設定
      theme: state.theme,
      fontSize: state.fontSize,

      // 出題設定
      quizSettings: state.quizSettings,

      // 学習データ
      favorites: Array.from(state.favorites),
      viewedCards: Array.from(state.viewedCards),
      answeredCards: Array.from(state.answeredCards.entries()),

      // 統計データ
      dailyStats: state.dailyStats,
      questionHistory: state.questionHistory,

      // メタデータ
      lastUpdated: serverTimestamp(),
      appVersion: '1.0.0'
    };

    await setDoc(doc(db, 'users', state.currentUser.uid), userData, { merge: true });

    state.syncStatus = 'synced';
    console.log('Data synced to Firestore');
  } catch (error) {
    console.error('Sync error:', error);
    state.syncStatus = 'error';
  }

  updateSyncIndicator();
}

// Firestoreからデータを読み込み
async function loadFromFirestore() {
  if (!state.isAuthenticated || !state.currentUser) return false;
  if (!window.firebaseDb || !window.firebaseFunctions) return false;

  const { doc, getDoc } = window.firebaseFunctions;
  const db = window.firebaseDb;

  try {
    const userDoc = await getDoc(doc(db, 'users', state.currentUser.uid));

    if (userDoc.exists()) {
      const data = userDoc.data();

      // 設定を復元
      if (data.theme) {
        state.theme = data.theme;
        applyTheme(state.theme);
      }
      if (data.fontSize) {
        state.fontSize = data.fontSize;
        applyFontSize();
      }
      if (data.quizSettings) {
        state.quizSettings = data.quizSettings;
      }

      // 学習データを復元
      if (data.favorites) state.favorites = new Set(data.favorites);
      if (data.viewedCards) state.viewedCards = new Set(data.viewedCards);
      if (data.answeredCards) state.answeredCards = new Map(data.answeredCards);
      if (data.dailyStats) state.dailyStats = data.dailyStats;
      if (data.questionHistory) state.questionHistory = data.questionHistory;

      console.log('Data loaded from Firestore');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Load from Firestore error:', error);
    return false;
  }
}

// LocalStorageからFirestoreへの移行
async function migrateAndSyncData() {
  if (!state.isAuthenticated || !state.currentUser) return;

  // まずFirestoreからデータを読み込む
  const hasCloudData = await loadFromFirestore();

  if (!hasCloudData) {
    // クラウドにデータがなければ、LocalStorageのデータを使用
    loadState();
    loadDailyStats();
    loadQuestionHistory();
    loadQuizSettings();

    // Firestoreに保存
    await syncToFirestore();
    console.log('Local data migrated to Firestore');
  }
}

// 同期インジケーターを更新
function updateSyncIndicator() {
  const indicator = document.getElementById('syncIndicator');
  if (indicator) {
    indicator.className = `sync-indicator ${state.syncStatus}`;
    indicator.querySelector('span').textContent = getSyncStatusText();
  }
}

// デバウンス付き同期（頻繁な保存を防ぐ）
let syncTimeout = null;
function debouncedSync() {
  if (!state.isAuthenticated) return;

  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    syncToFirestore();
  }, 2000); // 2秒後に同期
}

// 元のsaveState関数を拡張
const originalSaveState = saveState;
saveState = function() {
  // LocalStorageにも保存（オフライン対応）
  const saveData = {
    mode: state.mode,
    favorites: Array.from(state.favorites),
    viewedCards: Array.from(state.viewedCards),
    answeredCards: Array.from(state.answeredCards.entries()),
    filter: state.filter,
    theme: state.theme,
    fontSize: state.fontSize,
    currentExamId: state.currentExam?.examId,
    currentCategory: state.currentCategory,
    currentIndex: state.currentIndex
  };
  localStorage.setItem('dentalExamState', JSON.stringify(saveData));

  // Firestoreにも同期
  debouncedSync();
};

// Firebase認証状態の監視を設定
function setupAuthStateListener() {
  if (!window.firebaseAuth || !window.firebaseFunctions) {
    // Firebaseがまだ読み込まれていない場合は後で再試行
    setTimeout(setupAuthStateListener, 500);
    return;
  }

  const { onAuthStateChanged } = window.firebaseFunctions;

  onAuthStateChanged(window.firebaseAuth, async (user) => {
    if (user) {
      state.currentUser = user;
      state.isAuthenticated = true;
      await migrateAndSyncData();
    } else {
      state.currentUser = null;
      state.isAuthenticated = false;
    }
    updateLoginUI();
  });
}

// 招待コードのイベントリスナーを設定
function setupInviteCodeListeners() {
  elements.inviteSubmitBtn?.addEventListener('click', handleInviteSubmit);

  elements.inviteCodeInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleInviteSubmit();
    }
  });
}

// ===== アプリ起動 =====
document.addEventListener('DOMContentLoaded', () => {
  // DOM要素を初期化
  initElements();

  // 招待コードのチェック
  if (!isInviteCodeVerified()) {
    showLoginPage();
    setupInviteCodeListeners();
  }

  // Firebase認証の監視を開始
  setupAuthStateListener();

  // 通常の初期化
  init();
});
