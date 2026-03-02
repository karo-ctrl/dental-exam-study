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
  keywordSummaries: null, // キーワードまとめデータ
  summaryAllCards: [], // 全まとめカードのフラット配列（検索用）
  currentCategoryData: null,
  currentCategory: null,
  currentTopic: null,
  flattenedCards: [],
  recentSummaries: [], // 最近見たまとめ {id, title, categoryId, categoryName, color}
  summaryFavorites: [], // お気に入りまとめ {id, title, categoryId, categoryName, color}
  rankingPeriod: 'weekly', // 'weekly' or 'yearly'

  // オリジナル問題用データ
  originalDecks: [], // デッキ配列
  currentDeck: null, // 現在表示中のデッキ
  editingDeckId: null, // 編集中のデッキID
  editingCardId: null, // 編集中のカードID

  // フラッシュカード演習用
  flashcardIndex: 0, // 現在のカードインデックス
  flashcardOrder: [], // シャッフルされたカード順序
  flashcardCorrect: 0, // 正解数
  flashcardIncorrect: 0, // 不正解数
  isFlashcardFlipped: false, // カードがめくられているか

  // 成績管理用
  mockExams: [], // 模試成績配列
  editingMockId: null, // 編集中の模試ID
  statsChartPeriod: 'week', // 'week' or 'month'

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
  elements.summaryCategoryScreen = document.getElementById('summaryCategoryScreen');

  // まとめホームの要素
  elements.summarySearchInput = document.getElementById('summarySearchInput');
  elements.summarySearchClear = document.getElementById('summarySearchClear');
  elements.summarySearchResults = document.getElementById('summarySearchResults');
  elements.searchResultsCount = document.getElementById('searchResultsCount');
  elements.searchResultsList = document.getElementById('searchResultsList');
  elements.summaryRankingSection = document.getElementById('summaryRankingSection');
  elements.rankingList = document.getElementById('rankingList');
  elements.summaryFavoritesSection = document.getElementById('summaryFavoritesSection');
  elements.favoritesList = document.getElementById('favoritesList');
  elements.favoritesCount = document.getElementById('favoritesCount');
  elements.summaryCategoryTitle = document.getElementById('summaryCategoryTitle');
  elements.summaryCategoryCount = document.getElementById('summaryCategoryCount');
  elements.summaryTopicsList = document.getElementById('summaryTopicsList');

  // オリジナル問題の要素
  elements.deckList = document.getElementById('deckList');
  elements.addDeckBtn = document.getElementById('addDeckBtn');
  elements.importDeckBtn = document.getElementById('importDeckBtn');
  elements.deckFileInput = document.getElementById('deckFileInput');
  elements.deckDetailScreen = document.getElementById('deckDetailScreen');
  elements.deckDetailName = document.getElementById('deckDetailName');
  elements.deckDetailDescription = document.getElementById('deckDetailDescription');
  elements.deckDetailCardCount = document.getElementById('deckDetailCardCount');
  elements.deckDetailAccuracy = document.getElementById('deckDetailAccuracy');
  elements.editDeckBtn = document.getElementById('editDeckBtn');
  elements.deleteDeckBtn = document.getElementById('deleteDeckBtn');
  elements.exportDeckBtn = document.getElementById('exportDeckBtn');
  elements.startPracticeBtn = document.getElementById('startPracticeBtn');
  elements.deckCardList = document.getElementById('deckCardList');
  elements.addCardBtn = document.getElementById('addCardBtn');

  // フラッシュカード演習の要素
  elements.flashcardScreen = document.getElementById('flashcardScreen');
  elements.flashcard = document.getElementById('flashcard');
  elements.flashcardInner = document.getElementById('flashcardInner');
  elements.flashcardFront = document.getElementById('flashcardFront');
  elements.flashcardBack = document.getElementById('flashcardBack');
  elements.flashcardProgress = document.getElementById('flashcardProgress');
  elements.flashcardProgressFill = document.getElementById('flashcardProgressFill');
  elements.flashcardButtons = document.getElementById('flashcardButtons');
  elements.btnCorrect = document.getElementById('btnCorrect');
  elements.btnIncorrect = document.getElementById('btnIncorrect');
  elements.flashcardResultScreen = document.getElementById('flashcardResultScreen');
  elements.resultCorrect = document.getElementById('resultCorrect');
  elements.resultIncorrect = document.getElementById('resultIncorrect');
  elements.resultAccuracy = document.getElementById('resultAccuracy');
  elements.btnRetryPractice = document.getElementById('btnRetryPractice');
  elements.btnBackToDeck = document.getElementById('btnBackToDeck');

  // デッキモーダルの要素
  elements.deckModal = document.getElementById('deckModal');
  elements.deckModalTitle = document.getElementById('deckModalTitle');
  elements.deckNameInput = document.getElementById('deckNameInput');
  elements.deckDescInput = document.getElementById('deckDescInput');
  elements.deckTagsInput = document.getElementById('deckTagsInput');
  elements.deckModalSave = document.getElementById('deckModalSave');
  elements.deckModalCancel = document.getElementById('deckModalCancel');
  elements.deckModalClose = document.getElementById('deckModalClose');
  elements.deckModalBackdrop = document.getElementById('deckModalBackdrop');

  // カードモーダルの要素
  elements.cardModal = document.getElementById('cardModal');
  elements.cardModalTitle = document.getElementById('cardModalTitle');
  elements.cardFrontInput = document.getElementById('cardFrontInput');
  elements.cardBackInput = document.getElementById('cardBackInput');
  elements.cardTagsInput = document.getElementById('cardTagsInput');
  elements.cardModalSave = document.getElementById('cardModalSave');
  elements.cardModalCancel = document.getElementById('cardModalCancel');
  elements.cardModalClose = document.getElementById('cardModalClose');
  elements.cardModalBackdrop = document.getElementById('cardModalBackdrop');

  // 確認モーダルの要素
  elements.confirmModal = document.getElementById('confirmModal');
  elements.confirmModalTitle = document.getElementById('confirmModalTitle');
  elements.confirmModalMessage = document.getElementById('confirmModalMessage');
  elements.confirmModalConfirm = document.getElementById('confirmModalConfirm');
  elements.confirmModalCancel = document.getElementById('confirmModalCancel');
  elements.confirmModalBackdrop = document.getElementById('confirmModalBackdrop');

  // 成績管理の要素
  elements.statsHome = document.getElementById('statsHome');
  elements.statsTodayCount = document.getElementById('statsTodayCount');
  elements.statsTodayCompare = document.getElementById('statsTodayCompare');
  elements.statsTotalQuestions = document.getElementById('statsTotalQuestions');
  elements.statsTotalAccuracy = document.getElementById('statsTotalAccuracy');
  elements.statsStreak = document.getElementById('statsStreak');
  elements.statsBarChart = document.getElementById('statsBarChart');
  elements.statsSubjectSection = document.getElementById('statsSubjectSection');
  elements.statsSubjectList = document.getElementById('statsSubjectList');
  elements.mockExamList = document.getElementById('mockExamList');
  elements.mockChartSection = document.getElementById('mockChartSection');
  elements.mockLineChart = document.getElementById('mockLineChart');
  elements.addMockExamBtn = document.getElementById('addMockExamBtn');
  elements.learningStatsSection = document.getElementById('learningStatsSection');
  elements.mockExamSection = document.getElementById('mockExamSection');

  // 模試モーダルの要素
  elements.mockExamModal = document.getElementById('mockExamModal');
  elements.mockModalTitle = document.getElementById('mockModalTitle');
  elements.mockNameInput = document.getElementById('mockNameInput');
  elements.mockDateInput = document.getElementById('mockDateInput');
  elements.mockTotalScoreInput = document.getElementById('mockTotalScoreInput');
  elements.mockTotalMaxInput = document.getElementById('mockTotalMaxInput');
  elements.mockHisshuScoreInput = document.getElementById('mockHisshuScoreInput');
  elements.mockHisshuMaxInput = document.getElementById('mockHisshuMaxInput');
  elements.mockIppanScoreInput = document.getElementById('mockIppanScoreInput');
  elements.mockIppanMaxInput = document.getElementById('mockIppanMaxInput');
  elements.mockRinjitsuScoreInput = document.getElementById('mockRinjitsuScoreInput');
  elements.mockRinjitsuMaxInput = document.getElementById('mockRinjitsuMaxInput');
  elements.mockRankInput = document.getElementById('mockRankInput');
  elements.mockDeviationInput = document.getElementById('mockDeviationInput');
  elements.mockMemoInput = document.getElementById('mockMemoInput');
  elements.mockImageInput = document.getElementById('mockImageInput');
  elements.mockImageUpload = document.getElementById('mockImageUpload');
  elements.mockImagePreview = document.getElementById('mockImagePreview');
  elements.mockImagePreviewImg = document.getElementById('mockImagePreviewImg');
  elements.mockImagePlaceholder = document.getElementById('mockImagePlaceholder');
  elements.mockImageRemove = document.getElementById('mockImageRemove');
  elements.mockModalSave = document.getElementById('mockModalSave');
  elements.mockModalCancel = document.getElementById('mockModalCancel');
  elements.mockModalClose = document.getElementById('mockModalClose');
  elements.mockModalBackdrop = document.getElementById('mockModalBackdrop');

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
  elements.questionSource = document.getElementById('questionSource');
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

  // 関連まとめ
  elements.relatedSummaries = document.getElementById('relatedSummaries');
  elements.relatedSummariesList = document.getElementById('relatedSummariesList');

  // まとめモーダル
  elements.summaryModal = document.getElementById('summaryModal');
  elements.summaryModalBackdrop = document.getElementById('summaryModalBackdrop');
  elements.summaryModalClose = document.getElementById('summaryModalClose');
  elements.summaryModalTitle = document.getElementById('summaryModalTitle');
  elements.summaryModalBody = document.getElementById('summaryModalBody');
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
  elements.statsHome.style.display = 'none';
  elements.quizScreen.style.display = 'none';
  elements.questionNav.style.display = 'none';
  if (elements.summaryCategoryScreen) {
    elements.summaryCategoryScreen.style.display = 'none';
  }
  if (elements.deckDetailScreen) {
    elements.deckDetailScreen.style.display = 'none';
  }
  if (elements.flashcardScreen) {
    elements.flashcardScreen.style.display = 'none';
  }
  if (elements.flashcardResultScreen) {
    elements.flashcardResultScreen.style.display = 'none';
  }

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
        elements.menuBtn.style.display = 'none';
        // オリジナルホームを初期化
        initOriginalHome();
        break;
      case 'summary':
        console.log('[DEBUG] switchTab: summary タブに切り替え');
        elements.summaryHome.style.display = 'block';
        elements.headerTitle.textContent = 'まとめ';
        elements.backBtn.style.display = 'none';
        elements.menuBtn.style.display = 'none';
        // まとめホームを初期化
        console.log('[DEBUG] initSummaryHome() を呼び出し');
        initSummaryHome();
        break;
      case 'stats':
        elements.statsHome.style.display = 'block';
        elements.headerTitle.textContent = '成績管理';
        elements.backBtn.style.display = 'none';
        elements.menuBtn.style.display = 'none';
        // 成績管理ホームを初期化
        initStatsHome();
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
  // まとめカード画面からはカテゴリ画面に戻る
  if (state.currentView === 'summaryCard' && state.currentTab === 'summary') {
    const category = state.summaryIndex?.categories.find(c => c.id === state.currentCategory);
    if (category) {
      openSummaryCategory(state.currentCategory);
      return;
    }
  }

  // まとめカテゴリ画面からはまとめホームに戻る
  if (state.currentView === 'summaryCategory' && state.currentTab === 'summary') {
    if (elements.summaryCategoryScreen) {
      elements.summaryCategoryScreen.style.display = 'none';
    }
    elements.summaryHome.style.display = 'block';
    elements.quizScreen.style.display = 'none';
    elements.questionNav.style.display = 'none';
    elements.backBtn.style.display = 'none';
    elements.menuBtn.style.display = 'flex';
    elements.headerTitle.textContent = 'まとめ';
    state.currentView = 'home';
    return;
  }

  // オリジナル：演習結果画面からはデッキ詳細に戻る
  if (state.currentView === 'flashcardResult' && state.currentTab === 'original') {
    backToDeckDetail();
    return;
  }

  // オリジナル：フラッシュカード演習画面からはデッキ詳細に戻る
  if (state.currentView === 'flashcard' && state.currentTab === 'original') {
    backToDeckDetail();
    return;
  }

  // オリジナル：デッキ詳細画面からはオリジナルホームに戻る
  if (state.currentView === 'deckDetail' && state.currentTab === 'original') {
    backToOriginalHome();
    return;
  }

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

  // 問題にexamIdを付加
  const examId = state.currentExam.examId;
  if (state.filter === 'all') {
    state.filteredQuestions = state.currentExam.questions.map(q => ({ ...q, examId }));
  } else {
    state.filteredQuestions = state.currentExam.questions
      .filter(q => q.section === state.filter)
      .map(q => ({ ...q, examId }));
  }

  if (state.currentIndex >= state.filteredQuestions.length) {
    state.currentIndex = Math.max(0, state.filteredQuestions.length - 1);
  }
}

function renderQuestion() {
  if (state.filteredQuestions.length === 0) {
    elements.cardCategory.textContent = '-';
    elements.questionId.textContent = '';
    if (elements.questionSource) elements.questionSource.textContent = '';
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

  // 出典を設定（問題IDから回数を取得）
  const examNumber = question.id.split('-')[0];
  if (elements.questionSource) {
    elements.questionSource.textContent = `出典：第${examNumber}回歯科医師国家試験（厚生労働省）`;
  }

  elements.cardTitle.textContent = question.questionText;

  if (question.imageRef || (question.figureRefs && question.figureRefs.length > 0)) {
    elements.imageRef.style.display = 'flex';
    elements.imageRefText.textContent = question.imageRef || '本文中図表';
    renderImageThumbnails(question);
  } else {
    elements.imageRef.style.display = 'none';
    elements.imageThumbnails.innerHTML = '';
  }

  renderChoices(question);

  elements.answerArea.style.display = 'none';
  if (elements.relatedSummaries) {
    elements.relatedSummaries.style.display = 'none';
  }
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

  // 関連まとめを表示
  renderRelatedSummaries(question);

  saveState();
}

// ===== 関連まとめ機能 =====
function findRelatedKeywords(question) {
  if (!state.keywordSummaries || !state.keywordSummaries.keywords) {
    return [];
  }

  const searchText = question.questionText + ' ' +
    question.choices.map(c => c.text).join(' ');

  const matches = [];

  for (const kw of state.keywordSummaries.keywords) {
    // キーワードとその同義語をチェック
    const searchTerms = [kw.keyword, ...(kw.synonyms || [])];

    for (const term of searchTerms) {
      if (term && searchText.includes(term)) {
        matches.push(kw);
        break; // 同じキーワードを複数回追加しない
      }
    }
  }

  return matches;
}

function renderRelatedSummaries(question) {
  if (!elements.relatedSummaries || !elements.relatedSummariesList) {
    return;
  }

  const relatedKeywords = findRelatedKeywords(question);

  if (relatedKeywords.length === 0) {
    elements.relatedSummaries.style.display = 'none';
    return;
  }

  elements.relatedSummaries.style.display = 'block';
  elements.relatedSummariesList.innerHTML = relatedKeywords.map(kw => `
    <button class="related-summary-link" data-keyword-id="${kw.id}" data-html-file="${kw.htmlFile}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      </svg>
      ${kw.keyword}
    </button>
  `).join('');

  // クリックイベントを追加
  elements.relatedSummariesList.querySelectorAll('.related-summary-link').forEach(btn => {
    btn.addEventListener('click', () => {
      const keywordId = btn.dataset.keywordId;
      const htmlFile = btn.dataset.htmlFile;
      openSummaryModal(keywordId, htmlFile);
    });
  });
}

async function openSummaryModal(keywordId, htmlFile) {
  if (!elements.summaryModal) return;

  // キーワードデータを取得
  const keyword = state.keywordSummaries?.keywords?.find(kw => kw.id === keywordId);
  if (!keyword) return;

  elements.summaryModalTitle.textContent = keyword.keyword;
  elements.summaryModalBody.innerHTML = '<p style="text-align: center; color: var(--text-muted);">読み込み中...</p>';
  elements.summaryModal.style.display = 'flex';

  try {
    // HTMLファイルを読み込む
    const response = await fetch(`summaries/${htmlFile}`);
    if (response.ok) {
      const html = await response.text();
      elements.summaryModalBody.innerHTML = html;
    } else {
      // HTMLファイルがない場合はcontentを表示
      elements.summaryModalBody.innerHTML = formatSummaryContent(keyword.content);
    }
  } catch (error) {
    // エラー時はcontentを表示
    elements.summaryModalBody.innerHTML = formatSummaryContent(keyword.content);
  }
}

function formatSummaryContent(content) {
  if (!content) return '<p>まとめ内容がありません。</p>';

  // 簡易的な整形
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line)
    .map(line => `<p>${line}</p>`)
    .join('');
}

function closeSummaryModal() {
  if (elements.summaryModal) {
    elements.summaryModal.style.display = 'none';
  }
}

// ===== 画像表示機能 =====
function parseImageRef(imageRef, examId) {
  if (!imageRef) return [];

  // 新形式: "118A-7" または "118A-21A, 118A-21B, ..." → images/exam/118/118A-7.png
  const refs = imageRef.split(/[,、]\s*/);
  return refs
    .map(ref => ref.trim())
    .filter(ref => ref.length > 0)
    .map(ref => `images/exam/${examId}/${ref}.png`);
}

function renderImageThumbnails(question) {
  const examId = state.currentExam?.examId || question.examId;

  // 別冊写真 + 本文中図表を統合
  let imagePaths = [];
  if (question.imageRef) {
    imagePaths = imagePaths.concat(parseImageRef(question.imageRef, examId));
  }
  if (question.figureRefs && question.figureRefs.length > 0) {
    imagePaths = imagePaths.concat(question.figureRefs);
  }

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

// ===== まとめホーム画面 =====

// まとめホーム画面を初期化
async function initSummaryHome() {
  console.log('[DEBUG] initSummaryHome() 開始');

  // インデックスデータを読み込み
  if (!state.summaryIndex) {
    console.log('[DEBUG] summaryIndex がないので読み込み開始');
    try {
      const response = await fetch('./data/summaries/index.json');
      console.log('[DEBUG] index.json fetch 結果:', response.status);
      if (!response.ok) throw new Error('まとめデータの読み込みに失敗しました');
      state.summaryIndex = await response.json();
      console.log('[DEBUG] summaryIndex 読み込み完了');
    } catch (error) {
      console.error('[DEBUG] まとめインデックス読み込みエラー:', error);
      return;
    }
  } else {
    console.log('[DEBUG] summaryIndex は既に存在');
  }

  // トグルセクションを設定
  console.log('[DEBUG] setupSummaryToggles() 呼び出し');
  setupSummaryToggles();

  // キーワードまとめを読み込み（検索用）
  console.log('[DEBUG] loadKeywordSummaries() 呼び出し前');
  await loadKeywordSummaries();

  // お気に入りを表示
  loadSummaryFavorites();
  renderSummaryFavorites();

  // ランキングを表示
  loadRanking();

  // 検索イベントを設定
  setupSummarySearch();

  // バッジを更新
  updateSummaryBadges();
}

// トグルセクションを設定
function setupSummaryToggles() {
  const toggleHeaders = document.querySelectorAll('.summary-toggle-header');
  toggleHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const section = header.parentElement;
      section.classList.toggle('open');
    });
  });

  // ランキングタブを設定
  const rankingTabs = document.querySelectorAll('.ranking-tab');
  rankingTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      rankingTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.rankingPeriod = tab.dataset.period;
      renderRanking();
    });
  });
}

// バッジを更新
function updateSummaryBadges() {
  if (elements.favoritesCount) {
    elements.favoritesCount.textContent = state.summaryFavorites.length;
  }
}

// カテゴリグリッドを表示
function renderSummaryCategoriesGrid() {
  if (!state.summaryIndex || !elements.summaryCategoriesGrid) return;

  elements.summaryCategoriesGrid.innerHTML = state.summaryIndex.categories.map(cat => `
    <div class="summary-category-card" data-category-id="${cat.id}">
      <div class="summary-category-icon" style="background-color: ${cat.color}">
        ${getCategoryEmoji(cat.icon)}
      </div>
      <div class="summary-category-name">${cat.name}</div>
      <div class="summary-category-count">${cat.topicCount}件</div>
    </div>
  `).join('');

  // クリックイベント
  elements.summaryCategoriesGrid.querySelectorAll('.summary-category-card').forEach(card => {
    card.addEventListener('click', () => {
      openSummaryCategory(card.dataset.categoryId);
    });
  });
}

// キーワードまとめを読み込み
async function loadKeywordSummaries() {
  console.log('[DEBUG] loadKeywordSummaries() 開始');
  if (state.keywordSummaries) {
    console.log('[DEBUG] 既に読み込み済み');
    return;
  }

  try {
    console.log('[DEBUG] keywords.json を fetch 中...');
    const response = await fetch('./data/summaries/keywords.json');
    console.log('[DEBUG] fetch 結果:', response.status, response.ok);
    if (!response.ok) throw new Error('キーワードまとめデータの読み込みに失敗しました');
    state.keywordSummaries = await response.json();
    console.log(`[DEBUG] キーワードまとめ読み込み完了: ${state.keywordSummaries.keywords.length}件`);
  } catch (error) {
    console.error('[DEBUG] キーワードまとめ読み込みエラー:', error);
    state.keywordSummaries = { keywords: [] };
  }
}

// キーワードまとめを表示
function renderKeywordSummaries() {
  console.log('[DEBUG] renderKeywordSummaries() 開始');
  const container = document.getElementById('keywordSummariesList');
  const countBadge = document.getElementById('keywordCount');
  console.log('[DEBUG] container:', container);
  console.log('[DEBUG] state.keywordSummaries:', state.keywordSummaries);

  if (!container || !state.keywordSummaries) {
    console.log('[DEBUG] container または keywordSummaries がない');
    return;
  }

  const keywords = state.keywordSummaries.keywords;

  if (keywords.length === 0) {
    container.innerHTML = '<p class="empty-message">キーワードまとめがありません</p>';
    if (countBadge) countBadge.textContent = '0';
    return;
  }

  // キーワード数を更新
  if (countBadge) countBadge.textContent = keywords.length;

  // キーワードチップを生成
  container.innerHTML = keywords.map(kw => `
    <div class="keyword-summary-chip" data-html-file="${kw.htmlFile}" data-keyword="${kw.keyword}">
      <span class="keyword-name">${kw.keyword}</span>
      <span class="keyword-category">${kw.category}</span>
      ${kw.questions.length > 0 ? `<span class="question-count">${kw.questions.length}</span>` : ''}
    </div>
  `).join('');

  // クリックイベント
  container.querySelectorAll('.keyword-summary-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const htmlFile = chip.dataset.htmlFile;
      showKeywordSummaryModal(htmlFile);
    });
  });
}

// カテゴリ詳細画面を開く
async function openSummaryCategory(categoryId) {
  const category = state.summaryIndex.categories.find(c => c.id === categoryId);
  if (!category) return;

  // カテゴリデータを読み込み
  try {
    const response = await fetch(`./data/summaries/${categoryId}.json`);
    if (!response.ok) throw new Error('カテゴリデータの読み込みに失敗しました');
    state.currentCategoryData = await response.json();
  } catch (error) {
    console.error('カテゴリデータ読み込みエラー:', error);
    return;
  }

  // ヘッダー更新
  if (elements.summaryCategoryTitle) {
    elements.summaryCategoryTitle.textContent = category.name;
  }

  // カード数をカウント
  let cardCount = 0;
  state.currentCategoryData.topics.forEach(topic => {
    cardCount += topic.cards.length;
  });
  if (elements.summaryCategoryCount) {
    elements.summaryCategoryCount.textContent = `${cardCount}件`;
  }

  // トピックリストを表示
  renderSummaryTopicsList(category);

  // 画面を切り替え
  elements.summaryHome.style.display = 'none';
  elements.summaryCategoryScreen.style.display = 'block';
  elements.backBtn.style.display = 'block';
  elements.headerTitle.textContent = category.name;

  state.currentView = 'summaryCategory';
  state.currentCategory = categoryId;
}

// トピックリストを表示
function renderSummaryTopicsList(category) {
  if (!elements.summaryTopicsList || !state.currentCategoryData) return;

  elements.summaryTopicsList.innerHTML = state.currentCategoryData.topics.map((topic, topicIdx) => `
    <div class="summary-topic-group" data-topic-id="${topic.id}">
      <div class="summary-topic-header">
        <span class="summary-topic-name">${topic.name}</span>
        <svg class="summary-topic-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      <div class="summary-topic-cards">
        ${topic.cards.map((card, cardIdx) => `
          <div class="summary-card-item" data-card-id="${card.id}" data-category-id="${category.id}">
            <span class="summary-card-number">${cardIdx + 1}</span>
            <span class="summary-card-title">${card.title}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  // トピック開閉イベント
  elements.summaryTopicsList.querySelectorAll('.summary-topic-header').forEach(header => {
    header.addEventListener('click', () => {
      header.parentElement.classList.toggle('expanded');
    });
  });

  // カードクリックイベント
  elements.summaryTopicsList.querySelectorAll('.summary-card-item').forEach(item => {
    item.addEventListener('click', () => {
      openSummaryCard(item.dataset.cardId, item.dataset.categoryId);
    });
  });

  // 最初のトピックを開く
  const firstTopic = elements.summaryTopicsList.querySelector('.summary-topic-group');
  if (firstTopic) {
    firstTopic.classList.add('expanded');
  }
}

// まとめカードを開く
async function openSummaryCard(cardId, categoryId) {
  // カテゴリデータがなければ読み込み
  if (!state.currentCategoryData || state.currentCategoryData.categoryId !== categoryId) {
    try {
      const response = await fetch(`./data/summaries/${categoryId}.json`);
      if (!response.ok) throw new Error('カテゴリデータの読み込みに失敗しました');
      state.currentCategoryData = await response.json();
    } catch (error) {
      console.error('カテゴリデータ読み込みエラー:', error);
      return;
    }
  }

  // カードをフラット化してインデックスを見つける
  state.flattenedCards = [];
  let targetIndex = 0;
  state.currentCategoryData.topics.forEach(topic => {
    topic.cards.forEach(card => {
      if (card.id === cardId) {
        targetIndex = state.flattenedCards.length;
      }
      state.flattenedCards.push({
        ...card,
        topicId: topic.id,
        topicName: topic.name
      });
    });
  });

  state.currentIndex = targetIndex;
  state.currentCategory = categoryId;
  state.mode = 'summary';

  // 最近見たまとめに追加
  addToRecentSummaries(cardId, categoryId);

  // カード表示
  showSummaryCardScreen();
  renderSummaryCard();
  updateNavButtons();
}

// まとめカード画面を表示
function showSummaryCardScreen() {
  const category = state.summaryIndex?.categories.find(c => c.id === state.currentCategory);

  elements.summaryHome.style.display = 'none';
  elements.summaryCategoryScreen.style.display = 'none';
  elements.quizScreen.style.display = 'block';
  elements.quizCard.style.display = 'none';
  elements.summaryCard.style.display = 'block';
  elements.questionNav.style.display = 'flex';
  elements.backBtn.style.display = 'block';
  elements.headerTitle.textContent = category?.name || 'まとめ';

  state.currentView = 'summaryCard';
}

// 最近見たまとめに追加
function addToRecentSummaries(cardId, categoryId) {
  const category = state.summaryIndex?.categories.find(c => c.id === categoryId);
  const card = state.flattenedCards.find(c => c.id === cardId);

  if (!category || !card) return;

  // 既存のエントリを削除
  state.recentSummaries = state.recentSummaries.filter(r => r.id !== cardId);

  // 先頭に追加
  state.recentSummaries.unshift({
    id: cardId,
    title: card.title,
    categoryId: categoryId,
    categoryName: category.name,
    color: category.color
  });

  // 最大10件まで
  if (state.recentSummaries.length > 10) {
    state.recentSummaries = state.recentSummaries.slice(0, 10);
  }

  // 保存
  saveRecentSummaries();

  // Firestoreに閲覧記録
  recordSummaryView(cardId, categoryId, card.title, category.name, category.color);
}

// 最近見たまとめを保存
function saveRecentSummaries() {
  localStorage.setItem('dentalExamRecentSummaries', JSON.stringify(state.recentSummaries));
}

// 最近見たまとめを読み込み
function loadRecentSummaries() {
  const saved = localStorage.getItem('dentalExamRecentSummaries');
  if (saved) {
    state.recentSummaries = JSON.parse(saved);
  }
}

// 最近見たまとめを表示
function renderRecentSummaries() {
  if (!elements.summaryRecentList) return;

  if (state.recentSummaries.length === 0) {
    elements.summaryRecentList.innerHTML = '<p class="empty-message">まだ閲覧したまとめがありません</p>';
    return;
  }

  elements.summaryRecentList.innerHTML = state.recentSummaries.map(item => `
    <div class="summary-recent-item" data-card-id="${item.id}" data-category-id="${item.categoryId}">
      <div class="summary-recent-dot" style="background-color: ${item.color}"></div>
      <span class="summary-recent-title">${item.title}</span>
      <span class="summary-recent-category">${item.categoryName}</span>
    </div>
  `).join('');

  // クリックイベント
  elements.summaryRecentList.querySelectorAll('.summary-recent-item').forEach(item => {
    item.addEventListener('click', () => {
      openSummaryCard(item.dataset.cardId, item.dataset.categoryId);
    });
  });

  // バッジを更新
  if (elements.recentCount) {
    elements.recentCount.textContent = state.recentSummaries.length;
  }
}

// ===== ランキング機能 =====

// ランキングデータを読み込み
async function loadRanking() {
  if (!elements.rankingList) return;

  // Firestoreからランキングデータを取得
  try {
    if (window.firebaseDb && window.firebaseFunctions && state.isAuthenticated) {
      const { doc, getDoc } = window.firebaseFunctions;

      // 週間ランキング
      const weeklyDoc = await getDoc(doc(window.firebaseDb, 'rankings', 'weekly'));
      const yearlyDoc = await getDoc(doc(window.firebaseDb, 'rankings', 'yearly'));

      state.weeklyRanking = weeklyDoc.exists() ? weeklyDoc.data().items || [] : [];
      state.yearlyRanking = yearlyDoc.exists() ? yearlyDoc.data().items || [] : [];
    } else {
      // ローカルの閲覧履歴からランキングを生成
      generateLocalRanking();
    }
  } catch (error) {
    console.error('ランキング読み込みエラー:', error);
    generateLocalRanking();
  }

  renderRanking();
}

// ローカルデータからランキングを生成
function generateLocalRanking() {
  // 最近見たまとめから頻度をカウント
  const viewCounts = {};
  state.recentSummaries.forEach(item => {
    if (!viewCounts[item.id]) {
      viewCounts[item.id] = { ...item, count: 0 };
    }
    viewCounts[item.id].count++;
  });

  // ソートして上位5件を取得
  const sorted = Object.values(viewCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  state.weeklyRanking = sorted;
  state.yearlyRanking = sorted;
}

// ランキングを表示
function renderRanking() {
  if (!elements.rankingList) return;

  const ranking = state.rankingPeriod === 'weekly' ? state.weeklyRanking : state.yearlyRanking;

  if (!ranking || ranking.length === 0) {
    elements.rankingList.innerHTML = '<p class="empty-message">まだランキングデータがありません</p>';
    return;
  }

  elements.rankingList.innerHTML = ranking.map((item, index) => {
    const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'normal';
    return `
      <div class="ranking-item" data-card-id="${item.id}" data-category-id="${item.categoryId}">
        <div class="ranking-rank ${rankClass}">${index + 1}</div>
        <div class="ranking-info">
          <div class="ranking-title">${item.title}</div>
          <div class="ranking-category">${item.categoryName}</div>
        </div>
        <div class="ranking-views">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          ${item.count || 0}
        </div>
      </div>
    `;
  }).join('');

  // クリックイベント
  elements.rankingList.querySelectorAll('.ranking-item').forEach(item => {
    item.addEventListener('click', () => {
      openSummaryCard(item.dataset.cardId, item.dataset.categoryId);
    });
  });
}

// 閲覧をFirestoreに記録
async function recordSummaryView(cardId, categoryId, title, categoryName, color) {
  if (!window.firebaseDb || !window.firebaseFunctions || !state.isAuthenticated) return;

  try {
    const { doc, getDoc, setDoc, serverTimestamp } = window.firebaseFunctions;
    const viewRef = doc(window.firebaseDb, 'summaryViews', cardId);

    const viewDoc = await getDoc(viewRef);
    const currentData = viewDoc.exists() ? viewDoc.data() : { count: 0 };

    await setDoc(viewRef, {
      id: cardId,
      categoryId,
      title,
      categoryName,
      color,
      count: (currentData.count || 0) + 1,
      lastViewed: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('閲覧記録エラー:', error);
  }
}

// ===== お気に入り機能 =====

// お気に入りを読み込み
function loadSummaryFavorites() {
  const saved = localStorage.getItem('dentalExamSummaryFavorites');
  if (saved) {
    state.summaryFavorites = JSON.parse(saved);
  }
}

// お気に入りを保存
function saveSummaryFavorites() {
  localStorage.setItem('dentalExamSummaryFavorites', JSON.stringify(state.summaryFavorites));

  // Firestoreにも同期
  if (state.isAuthenticated) {
    scheduleSyncToFirestore();
  }
}

// お気に入りを表示
function renderSummaryFavorites() {
  if (!elements.favoritesList) return;

  if (state.summaryFavorites.length === 0) {
    elements.favoritesList.innerHTML = '<p class="empty-message">お気に入りに追加したまとめがありません</p>';
    return;
  }

  elements.favoritesList.innerHTML = state.summaryFavorites.map(item => `
    <div class="favorite-item" data-card-id="${item.id}" data-category-id="${item.categoryId}">
      <svg class="favorite-star" width="18" height="18" viewBox="0 0 24 24" fill="#ffc107" stroke="#ffc107" stroke-width="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
      <div class="favorite-info">
        <div class="favorite-title">${item.title}</div>
        <div class="favorite-category">${item.categoryName}</div>
      </div>
      <button class="favorite-remove" data-card-id="${item.id}" title="お気に入りから削除">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `).join('');

  // カードクリックイベント
  elements.favoritesList.querySelectorAll('.favorite-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (!e.target.closest('.favorite-remove')) {
        openSummaryCard(item.dataset.cardId, item.dataset.categoryId);
      }
    });
  });

  // 削除ボタンクリックイベント
  elements.favoritesList.querySelectorAll('.favorite-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeSummaryFavorite(btn.dataset.cardId);
    });
  });

  // バッジを更新
  if (elements.favoritesCount) {
    elements.favoritesCount.textContent = state.summaryFavorites.length;
  }
}

// お気に入りに追加
function addSummaryFavorite(cardId, title, categoryId, categoryName, color) {
  // 既に存在する場合は追加しない
  if (state.summaryFavorites.some(f => f.id === cardId)) return false;

  state.summaryFavorites.unshift({
    id: cardId,
    title,
    categoryId,
    categoryName,
    color
  });

  saveSummaryFavorites();
  renderSummaryFavorites();
  return true;
}

// お気に入りから削除
function removeSummaryFavorite(cardId) {
  state.summaryFavorites = state.summaryFavorites.filter(f => f.id !== cardId);
  saveSummaryFavorites();
  renderSummaryFavorites();
}

// お気に入り状態を確認
function isSummaryFavorite(cardId) {
  return state.summaryFavorites.some(f => f.id === cardId);
}

// まとめ検索を設定
function setupSummarySearch() {
  if (!elements.summarySearchInput) return;

  let searchTimeout = null;

  elements.summarySearchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();

    // クリアボタン表示切替
    if (elements.summarySearchClear) {
      elements.summarySearchClear.style.display = query ? 'flex' : 'none';
    }

    // デバウンス検索
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      if (query.length >= 2) {
        searchSummaries(query);
      } else {
        hideSearchResults();
      }
    }, 300);
  });

  // クリアボタン
  elements.summarySearchClear?.addEventListener('click', () => {
    elements.summarySearchInput.value = '';
    elements.summarySearchClear.style.display = 'none';
    hideSearchResults();
  });
}

// まとめを検索
async function searchSummaries(query) {
  const titleMatches = [];  // タイトル一致
  const contentMatches = []; // 本文一致
  const lowerQuery = query.toLowerCase();

  // キーワードまとめを検索
  if (state.keywordSummaries?.keywords) {
    for (const kw of state.keywordSummaries.keywords) {
      // タイトル（keyword, synonyms）で検索
      const titleText = [
        kw.keyword,
        ...(kw.synonyms || [])
      ].join(' ').toLowerCase();

      const isTitleMatch = titleText.includes(lowerQuery);

      // 本文（content）で検索
      const contentText = (kw.content || '').toLowerCase();
      const isContentMatch = contentText.includes(lowerQuery);

      if (isTitleMatch) {
        titleMatches.push({
          id: kw.id,
          title: kw.keyword,
          categoryName: kw.category,
          color: '#4CAF50',
          isKeyword: true,
          htmlFile: kw.htmlFile
        });
      } else if (isContentMatch) {
        contentMatches.push({
          id: kw.id,
          title: kw.keyword,
          categoryName: kw.category,
          color: '#4CAF50',
          isKeyword: true,
          htmlFile: kw.htmlFile
        });
      }
    }
  }

  // タイトル一致を上位に、本文一致を下位にソートして結合
  const results = [...titleMatches, ...contentMatches];

  // 結果を表示
  showSearchResults(results);
}

// 検索結果を表示
function showSearchResults(results) {
  if (!elements.summarySearchResults) return;

  elements.summarySearchResults.style.display = 'block';
  // ランキングとお気に入りは表示したまま

  if (elements.searchResultsCount) {
    elements.searchResultsCount.textContent = `${results.length}件の結果`;
  }

  if (results.length === 0) {
    elements.searchResultsList.innerHTML = '<p class="empty-message">該当するまとめが見つかりませんでした</p>';
    return;
  }

  elements.searchResultsList.innerHTML = results.slice(0, 30).map(item => `
    <div class="search-result-item" data-item-id="${item.id}" data-is-keyword="${item.isKeyword || false}" data-html-file="${item.htmlFile || ''}">
      <div class="search-result-icon" style="background-color: ${item.color}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      </div>
      <div class="search-result-content">
        <div class="search-result-title">${item.title}</div>
        <div class="search-result-category">${item.categoryName}</div>
      </div>
    </div>
  `).join('');

  // クリックイベント
  elements.searchResultsList.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const isKeyword = item.dataset.isKeyword === 'true';
      if (isKeyword) {
        const htmlFile = item.dataset.htmlFile;
        showKeywordSummaryModal(htmlFile);
      } else {
        openSummaryCard(item.dataset.itemId, item.dataset.categoryId);
      }
    });
  });
}

// 検索結果を非表示
function hideSearchResults() {
  if (elements.summarySearchResults) {
    elements.summarySearchResults.style.display = 'none';
  }
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

// ===== オリジナル問題機能 =====

// オリジナルホーム画面を初期化
function initOriginalHome() {
  loadOriginalDecks();
  renderDeckList();
  setupOriginalEventListeners();
}

// デッキをLocalStorageから読み込み
function loadOriginalDecks() {
  const saved = localStorage.getItem('dentalExamOriginalDecks');
  if (saved) {
    state.originalDecks = JSON.parse(saved);
  }
}

// デッキをLocalStorageに保存
function saveOriginalDecks() {
  localStorage.setItem('dentalExamOriginalDecks', JSON.stringify(state.originalDecks));
  // Firestoreにも同期
  if (state.isAuthenticated) {
    scheduleSyncToFirestore();
  }
}

// デッキリストを表示
function renderDeckList() {
  if (!elements.deckList) return;

  if (state.originalDecks.length === 0) {
    elements.deckList.innerHTML = '<p class="empty-message">まだデッキがありません。新規作成ボタンからデッキを作成しましょう。</p>';
    return;
  }

  elements.deckList.innerHTML = state.originalDecks.map(deck => {
    const cardCount = deck.cards?.length || 0;
    const accuracy = calculateDeckAccuracy(deck);
    const accuracyClass = accuracy >= 70 ? 'good' : accuracy >= 40 ? 'medium' : 'poor';
    const accuracyText = accuracy !== null ? `${accuracy}%` : '--';

    return `
      <div class="deck-item" data-deck-id="${deck.deckId}">
        <div class="deck-icon">📚</div>
        <div class="deck-info">
          <div class="deck-name">${escapeHtml(deck.deckName)}</div>
          <div class="deck-meta">
            <span class="deck-card-count">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              ${cardCount}枚
            </span>
            <span class="deck-accuracy ${accuracyClass}">
              正解率: ${accuracyText}
            </span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // デッキクリックイベント
  elements.deckList.querySelectorAll('.deck-item').forEach(item => {
    item.addEventListener('click', () => {
      openDeckDetail(item.dataset.deckId);
    });
  });
}

// デッキ正解率を計算
function calculateDeckAccuracy(deck) {
  if (!deck.stats || deck.stats.totalAttempts === 0) return null;
  return Math.round((deck.stats.correctCount / deck.stats.totalAttempts) * 100);
}

// HTMLエスケープ
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// オリジナル機能のイベントリスナーを設定
function setupOriginalEventListeners() {
  // 新規デッキ作成ボタン
  elements.addDeckBtn?.addEventListener('click', () => {
    openDeckModal();
  });

  // インポートボタン
  elements.importDeckBtn?.addEventListener('click', () => {
    elements.deckFileInput?.click();
  });

  // ファイル選択
  elements.deckFileInput?.addEventListener('change', handleDeckImport);

  // デッキモーダル
  elements.deckModalSave?.addEventListener('click', saveDeck);
  elements.deckModalCancel?.addEventListener('click', closeDeckModal);
  elements.deckModalClose?.addEventListener('click', closeDeckModal);
  elements.deckModalBackdrop?.addEventListener('click', closeDeckModal);

  // カードモーダル
  elements.cardModalSave?.addEventListener('click', saveCard);
  elements.cardModalCancel?.addEventListener('click', closeCardModal);
  elements.cardModalClose?.addEventListener('click', closeCardModal);
  elements.cardModalBackdrop?.addEventListener('click', closeCardModal);

  // 確認モーダル
  elements.confirmModalCancel?.addEventListener('click', closeConfirmModal);
  elements.confirmModalBackdrop?.addEventListener('click', closeConfirmModal);

  // デッキ詳細画面のボタン
  elements.editDeckBtn?.addEventListener('click', () => {
    if (state.currentDeck) {
      openDeckModal(state.currentDeck.deckId);
    }
  });

  elements.deleteDeckBtn?.addEventListener('click', () => {
    if (state.currentDeck) {
      showDeleteConfirm('deck', state.currentDeck.deckId);
    }
  });

  elements.exportDeckBtn?.addEventListener('click', () => {
    if (state.currentDeck) {
      exportDeck(state.currentDeck.deckId);
    }
  });

  elements.addCardBtn?.addEventListener('click', () => {
    openCardModal();
  });

  elements.startPracticeBtn?.addEventListener('click', startPractice);

  // フラッシュカード
  elements.flashcard?.addEventListener('click', flipFlashcard);
  elements.btnCorrect?.addEventListener('click', () => answerFlashcard(true));
  elements.btnIncorrect?.addEventListener('click', () => answerFlashcard(false));

  // 結果画面
  elements.btnRetryPractice?.addEventListener('click', startPractice);
  elements.btnBackToDeck?.addEventListener('click', backToDeckDetail);
}

// デッキモーダルを開く
function openDeckModal(deckId = null) {
  state.editingDeckId = deckId;

  if (deckId) {
    // 編集モード
    const deck = state.originalDecks.find(d => d.deckId === deckId);
    if (!deck) return;

    elements.deckModalTitle.textContent = 'デッキを編集';
    elements.deckNameInput.value = deck.deckName;
    elements.deckDescInput.value = deck.description || '';
    elements.deckTagsInput.value = (deck.tags || []).join(', ');
  } else {
    // 新規作成モード
    elements.deckModalTitle.textContent = '新規デッキ作成';
    elements.deckNameInput.value = '';
    elements.deckDescInput.value = '';
    elements.deckTagsInput.value = '';
  }

  elements.deckModal.style.display = 'flex';
}

// デッキモーダルを閉じる
function closeDeckModal() {
  elements.deckModal.style.display = 'none';
  state.editingDeckId = null;
}

// デッキを保存
function saveDeck() {
  const name = elements.deckNameInput.value.trim();
  if (!name) {
    alert('デッキ名を入力してください');
    return;
  }

  const description = elements.deckDescInput.value.trim();
  const tags = elements.deckTagsInput.value
    .split(',')
    .map(t => t.trim())
    .filter(t => t);

  if (state.editingDeckId) {
    // 編集
    const deck = state.originalDecks.find(d => d.deckId === state.editingDeckId);
    if (deck) {
      deck.deckName = name;
      deck.description = description;
      deck.tags = tags;
    }
  } else {
    // 新規作成
    const newDeck = {
      deckId: 'deck-' + Date.now(),
      deckName: name,
      description: description,
      tags: tags,
      cards: [],
      stats: {
        totalAttempts: 0,
        correctCount: 0
      },
      createdAt: new Date().toISOString()
    };
    state.originalDecks.push(newDeck);
  }

  saveOriginalDecks();
  renderDeckList();
  closeDeckModal();

  // デッキ詳細画面が開いていれば更新
  if (state.currentDeck && state.editingDeckId === state.currentDeck.deckId) {
    updateDeckDetailHeader();
  }
}

// デッキ詳細画面を開く
function openDeckDetail(deckId) {
  const deck = state.originalDecks.find(d => d.deckId === deckId);
  if (!deck) return;

  state.currentDeck = deck;
  state.currentView = 'deckDetail';

  // ホーム画面を非表示
  elements.originalHome.style.display = 'none';
  elements.deckDetailScreen.style.display = 'block';

  // ヘッダー更新
  elements.headerTitle.textContent = deck.deckName;
  elements.backBtn.style.display = 'flex';
  elements.menuBtn.style.display = 'none';

  // 詳細を表示
  updateDeckDetailHeader();
  renderDeckCardList();
}

// デッキ詳細ヘッダーを更新
function updateDeckDetailHeader() {
  const deck = state.currentDeck;
  if (!deck) return;

  elements.deckDetailName.textContent = deck.deckName;
  elements.deckDetailDescription.textContent = deck.description || '';
  elements.deckDetailCardCount.textContent = `${deck.cards?.length || 0}枚`;

  const accuracy = calculateDeckAccuracy(deck);
  elements.deckDetailAccuracy.textContent = accuracy !== null ? `正解率: ${accuracy}%` : '正解率: --';

  // カードがない場合は演習ボタンを無効化
  elements.startPracticeBtn.disabled = !deck.cards || deck.cards.length === 0;
}

// デッキのカードリストを表示
function renderDeckCardList() {
  if (!elements.deckCardList || !state.currentDeck) return;

  const cards = state.currentDeck.cards || [];

  if (cards.length === 0) {
    elements.deckCardList.innerHTML = '<p class="empty-message">まだカードがありません。カード追加ボタンから追加しましょう。</p>';
    return;
  }

  elements.deckCardList.innerHTML = cards.map((card, index) => `
    <div class="card-item" data-card-id="${card.id}">
      <span class="card-number">${index + 1}</span>
      <div class="card-preview">
        <div class="card-front-preview">${escapeHtml(card.front)}</div>
        <div class="card-back-preview">${escapeHtml(card.back)}</div>
      </div>
      <div class="card-actions">
        <button class="btn-edit" data-card-id="${card.id}" title="編集">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button class="btn-delete" data-card-id="${card.id}" title="削除">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  `).join('');

  // 編集ボタンイベント
  elements.deckCardList.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openCardModal(btn.dataset.cardId);
    });
  });

  // 削除ボタンイベント
  elements.deckCardList.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      showDeleteConfirm('card', btn.dataset.cardId);
    });
  });
}

// カードモーダルを開く
function openCardModal(cardId = null) {
  state.editingCardId = cardId;

  if (cardId) {
    // 編集モード
    const card = state.currentDeck?.cards?.find(c => c.id === cardId);
    if (!card) return;

    elements.cardModalTitle.textContent = 'カードを編集';
    elements.cardFrontInput.value = card.front;
    elements.cardBackInput.value = card.back;
    elements.cardTagsInput.value = (card.tags || []).join(', ');
  } else {
    // 新規作成モード
    elements.cardModalTitle.textContent = 'カード追加';
    elements.cardFrontInput.value = '';
    elements.cardBackInput.value = '';
    elements.cardTagsInput.value = '';
  }

  elements.cardModal.style.display = 'flex';
}

// カードモーダルを閉じる
function closeCardModal() {
  elements.cardModal.style.display = 'none';
  state.editingCardId = null;
}

// カードを保存
function saveCard() {
  const front = elements.cardFrontInput.value.trim();
  const back = elements.cardBackInput.value.trim();

  if (!front || !back) {
    alert('表面と裏面を入力してください');
    return;
  }

  const tags = elements.cardTagsInput.value
    .split(',')
    .map(t => t.trim())
    .filter(t => t);

  if (!state.currentDeck) return;

  if (state.editingCardId) {
    // 編集
    const card = state.currentDeck.cards?.find(c => c.id === state.editingCardId);
    if (card) {
      card.front = front;
      card.back = back;
      card.tags = tags;
    }
  } else {
    // 新規作成
    if (!state.currentDeck.cards) {
      state.currentDeck.cards = [];
    }
    state.currentDeck.cards.push({
      id: 'card-' + Date.now(),
      front: front,
      back: back,
      tags: tags,
      image: null
    });
  }

  saveOriginalDecks();
  renderDeckCardList();
  updateDeckDetailHeader();
  closeCardModal();
}

// 削除確認モーダルを表示
let deleteTarget = { type: null, id: null };

function showDeleteConfirm(type, id) {
  deleteTarget = { type, id };

  if (type === 'deck') {
    const deck = state.originalDecks.find(d => d.deckId === id);
    elements.confirmModalTitle.textContent = 'デッキを削除';
    elements.confirmModalMessage.textContent = `「${deck?.deckName || ''}」を削除しますか？この操作は取り消せません。`;
  } else {
    elements.confirmModalTitle.textContent = 'カードを削除';
    elements.confirmModalMessage.textContent = 'このカードを削除しますか？この操作は取り消せません。';
  }

  elements.confirmModalConfirm.onclick = confirmDelete;
  elements.confirmModal.style.display = 'flex';
}

// 削除を実行
function confirmDelete() {
  if (deleteTarget.type === 'deck') {
    state.originalDecks = state.originalDecks.filter(d => d.deckId !== deleteTarget.id);
    saveOriginalDecks();
    renderDeckList();
    closeConfirmModal();
    // デッキ詳細画面を閉じてホームに戻る
    backToOriginalHome();
  } else if (deleteTarget.type === 'card') {
    if (state.currentDeck?.cards) {
      state.currentDeck.cards = state.currentDeck.cards.filter(c => c.id !== deleteTarget.id);
      saveOriginalDecks();
      renderDeckCardList();
      updateDeckDetailHeader();
    }
    closeConfirmModal();
  }
}

// 確認モーダルを閉じる
function closeConfirmModal() {
  elements.confirmModal.style.display = 'none';
  deleteTarget = { type: null, id: null };
}

// オリジナルホームに戻る
function backToOriginalHome() {
  elements.deckDetailScreen.style.display = 'none';
  elements.flashcardScreen.style.display = 'none';
  elements.flashcardResultScreen.style.display = 'none';
  elements.originalHome.style.display = 'block';

  elements.headerTitle.textContent = 'オリジナル';
  elements.backBtn.style.display = 'none';
  elements.menuBtn.style.display = 'flex';

  state.currentView = 'home';
  state.currentDeck = null;
}

// デッキ詳細に戻る
function backToDeckDetail() {
  elements.flashcardScreen.style.display = 'none';
  elements.flashcardResultScreen.style.display = 'none';
  elements.deckDetailScreen.style.display = 'block';

  elements.headerTitle.textContent = state.currentDeck?.deckName || 'デッキ';
  state.currentView = 'deckDetail';
}

// フラッシュカード演習を開始
function startPractice() {
  if (!state.currentDeck?.cards || state.currentDeck.cards.length === 0) {
    alert('カードがありません');
    return;
  }

  // シャッフル
  state.flashcardOrder = [...state.currentDeck.cards]
    .map((card, index) => ({ card, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(item => item.card);

  state.flashcardIndex = 0;
  state.flashcardCorrect = 0;
  state.flashcardIncorrect = 0;
  state.isFlashcardFlipped = false;
  state.currentView = 'flashcard';

  // 画面切り替え
  elements.deckDetailScreen.style.display = 'none';
  elements.flashcardResultScreen.style.display = 'none';
  elements.flashcardScreen.style.display = 'block';

  elements.headerTitle.textContent = '演習';
  elements.backBtn.style.display = 'flex';

  // 最初のカードを表示
  showFlashcard();
}

// フラッシュカードを表示
function showFlashcard() {
  const card = state.flashcardOrder[state.flashcardIndex];
  if (!card) return;

  // プログレス更新
  const total = state.flashcardOrder.length;
  const current = state.flashcardIndex + 1;
  elements.flashcardProgress.textContent = `${current} / ${total}`;
  elements.flashcardProgressFill.style.width = `${(current / total) * 100}%`;

  // カード内容
  elements.flashcardFront.textContent = card.front;
  elements.flashcardBack.textContent = card.back;

  // リセット
  elements.flashcard.classList.remove('flipped');
  elements.flashcardButtons.style.display = 'none';
  state.isFlashcardFlipped = false;
}

// フラッシュカードをめくる
function flipFlashcard() {
  if (state.isFlashcardFlipped) return;

  elements.flashcard.classList.add('flipped');
  elements.flashcardButtons.style.display = 'flex';
  state.isFlashcardFlipped = true;
}

// 回答する
function answerFlashcard(correct) {
  if (correct) {
    state.flashcardCorrect++;
  } else {
    state.flashcardIncorrect++;
  }

  // 次のカードへ
  state.flashcardIndex++;

  if (state.flashcardIndex >= state.flashcardOrder.length) {
    // 演習終了
    finishPractice();
  } else {
    showFlashcard();
  }
}

// 演習終了
function finishPractice() {
  // 統計を更新
  if (state.currentDeck) {
    if (!state.currentDeck.stats) {
      state.currentDeck.stats = { totalAttempts: 0, correctCount: 0 };
    }
    state.currentDeck.stats.totalAttempts += state.flashcardOrder.length;
    state.currentDeck.stats.correctCount += state.flashcardCorrect;
    saveOriginalDecks();
  }

  // 結果画面を表示
  elements.flashcardScreen.style.display = 'none';
  elements.flashcardResultScreen.style.display = 'block';

  elements.resultCorrect.textContent = state.flashcardCorrect;
  elements.resultIncorrect.textContent = state.flashcardIncorrect;

  const total = state.flashcardCorrect + state.flashcardIncorrect;
  const accuracy = total > 0 ? Math.round((state.flashcardCorrect / total) * 100) : 0;
  elements.resultAccuracy.textContent = `${accuracy}%`;

  elements.headerTitle.textContent = '結果';
  state.currentView = 'flashcardResult';
}

// デッキをエクスポート
function exportDeck(deckId) {
  const deck = state.originalDecks.find(d => d.deckId === deckId);
  if (!deck) return;

  // エクスポート用にデータを整形
  const exportData = {
    deckName: deck.deckName,
    description: deck.description || '',
    tags: deck.tags || [],
    cards: (deck.cards || []).map(card => ({
      front: card.front,
      back: card.back,
      tags: card.tags || []
    })),
    exportedAt: new Date().toISOString()
  };

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${deck.deckName}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// デッキをインポート
function handleDeckImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);

      // バリデーション
      if (!data.deckName || !data.cards || !Array.isArray(data.cards)) {
        throw new Error('無効なデッキファイルです');
      }

      // インポート
      const newDeck = {
        deckId: 'deck-' + Date.now(),
        deckName: data.deckName,
        description: data.description || '',
        tags: data.tags || [],
        cards: data.cards.map((card, index) => ({
          id: 'card-' + Date.now() + '-' + index,
          front: card.front,
          back: card.back,
          tags: card.tags || [],
          image: null
        })),
        stats: {
          totalAttempts: 0,
          correctCount: 0
        },
        createdAt: new Date().toISOString(),
        importedAt: new Date().toISOString()
      };

      state.originalDecks.push(newDeck);
      saveOriginalDecks();
      renderDeckList();

      alert(`「${data.deckName}」をインポートしました（${data.cards.length}枚）`);
    } catch (error) {
      console.error('インポートエラー:', error);
      alert('デッキのインポートに失敗しました。ファイル形式を確認してください。');
    }
  };

  reader.readAsText(file);
  event.target.value = ''; // リセット
}

// ===== 成績管理機能 =====

// 成績管理ホームを初期化
function initStatsHome() {
  loadMockExams();
  renderLearningStats();
  renderMockExamList();
  setupStatsEventListeners();
}

// 学習統計を表示
function renderLearningStats() {
  // 今日の問題数
  const today = new Date().toISOString().split('T')[0];
  const todayCount = state.dailyStats[today] || 0;

  if (elements.statsTodayCount) {
    elements.statsTodayCount.textContent = todayCount;
  }

  // 前週平均との比較
  const lastWeekAvg = calculateLastWeekAverage();
  if (elements.statsTodayCompare) {
    const diff = todayCount - lastWeekAvg;
    const badge = elements.statsTodayCompare.querySelector('.compare-badge');
    if (badge) {
      badge.className = 'compare-badge';
      if (diff > 0) {
        badge.classList.add('positive');
        badge.textContent = `+${diff}`;
      } else if (diff < 0) {
        badge.classList.add('negative');
        badge.textContent = `${diff}`;
      } else {
        badge.classList.add('neutral');
        badge.textContent = '±0';
      }
    }
  }

  // 総回答数
  const totalQuestions = Object.values(state.dailyStats).reduce((sum, count) => sum + count, 0);
  if (elements.statsTotalQuestions) {
    elements.statsTotalQuestions.textContent = totalQuestions.toLocaleString();
  }

  // 正答率
  const accuracy = calculateOverallAccuracy();
  if (elements.statsTotalAccuracy) {
    elements.statsTotalAccuracy.textContent = accuracy !== null ? `${accuracy}%` : '--%';
  }

  // 連続日数
  const streak = calculateStreak();
  if (elements.statsStreak) {
    elements.statsStreak.textContent = streak;
  }

  // 週間/月間グラフを描画
  renderStatsChart();

  // 科目別正答率を描画
  renderSubjectStats();
}

// 前週平均を計算
function calculateLastWeekAverage() {
  const dates = [];
  const today = new Date();

  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }

  const counts = dates.map(date => state.dailyStats[date] || 0);
  const sum = counts.reduce((a, b) => a + b, 0);
  return Math.round(sum / 7);
}

// 全体正答率を計算
function calculateOverallAccuracy() {
  let totalCorrect = 0;
  let totalAttempts = 0;

  Object.values(state.questionHistory).forEach(history => {
    if (history.history && history.history.length > 0) {
      totalAttempts += history.history.length;
      totalCorrect += history.history.filter(h => h.correct).length;
    }
  });

  if (totalAttempts === 0) return null;
  return Math.round((totalCorrect / totalAttempts) * 100);
}

// 連続日数を計算
function calculateStreak() {
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    if (state.dailyStats[dateStr] && state.dailyStats[dateStr] > 0) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return streak;
}

// 学習グラフを描画
function renderStatsChart() {
  if (!elements.statsBarChart) return;

  const period = state.statsChartPeriod;
  const days = period === 'week' ? 7 : 30;
  const data = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const count = state.dailyStats[dateStr] || 0;
    const label = period === 'week'
      ? ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]
      : `${date.getMonth() + 1}/${date.getDate()}`;

    data.push({ date: dateStr, count, label });
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);

  elements.statsBarChart.innerHTML = data.map(d => {
    const height = (d.count / maxCount) * 100;
    return `
      <div class="bar-item">
        <div class="bar-container">
          <span class="bar-value">${d.count > 0 ? d.count : ''}</span>
          <div class="bar" style="height: ${height}%"></div>
        </div>
        <span class="bar-label">${d.label}</span>
      </div>
    `;
  }).join('');
}

// 科目別正答率を表示
function renderSubjectStats() {
  if (!elements.statsSubjectSection || !elements.statsSubjectList) return;

  const subjectStats = {};

  Object.entries(state.questionHistory).forEach(([id, history]) => {
    if (history.history && history.history.length > 0) {
      const subject = history.subject || '不明';
      if (!subjectStats[subject]) {
        subjectStats[subject] = { correct: 0, total: 0 };
      }
      subjectStats[subject].total += history.history.length;
      subjectStats[subject].correct += history.history.filter(h => h.correct).length;
    }
  });

  const subjects = Object.entries(subjectStats)
    .map(([name, stats]) => ({
      name,
      accuracy: Math.round((stats.correct / stats.total) * 100),
      total: stats.total
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  if (subjects.length === 0) {
    elements.statsSubjectSection.style.display = 'none';
    return;
  }

  elements.statsSubjectSection.style.display = 'block';
  elements.statsSubjectList.innerHTML = subjects.map(s => `
    <div class="stats-subject-item">
      <span class="subject-name">${s.name}</span>
      <div class="subject-bar-container">
        <div class="subject-bar" style="width: ${s.accuracy}%"></div>
      </div>
      <span class="subject-value">${s.accuracy}%</span>
    </div>
  `).join('');
}

// 成績管理のイベントリスナーを設定
function setupStatsEventListeners() {
  // トグルセクション
  document.querySelectorAll('.stats-toggle-header').forEach(header => {
    header.addEventListener('click', (e) => {
      // 追加ボタンのクリックは除外
      if (e.target.closest('.btn-add-mock')) return;
      const section = header.parentElement;
      section.classList.toggle('open');
    });
  });

  // グラフ期間タブ
  document.querySelectorAll('.stats-chart-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.stats-chart-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.statsChartPeriod = tab.dataset.period;
      renderStatsChart();
    });
  });

  // 模試追加ボタン
  elements.addMockExamBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    openMockModal();
  });

  // 模試モーダル
  elements.mockModalSave?.addEventListener('click', saveMockExam);
  elements.mockModalCancel?.addEventListener('click', closeMockModal);
  elements.mockModalClose?.addEventListener('click', closeMockModal);
  elements.mockModalBackdrop?.addEventListener('click', closeMockModal);

  // 画像アップロード
  elements.mockImageUpload?.addEventListener('click', () => {
    elements.mockImageInput?.click();
  });

  elements.mockImageInput?.addEventListener('change', handleMockImageSelect);

  elements.mockImageRemove?.addEventListener('click', (e) => {
    e.stopPropagation();
    removeMockImage();
  });
}

// 模試をLocalStorageから読み込み
function loadMockExams() {
  const saved = localStorage.getItem('dentalExamMockExams');
  if (saved) {
    state.mockExams = JSON.parse(saved);
  }
}

// 模試をLocalStorageに保存
function saveMockExamsToStorage() {
  localStorage.setItem('dentalExamMockExams', JSON.stringify(state.mockExams));
  // Firestoreにも同期
  if (state.isAuthenticated) {
    scheduleSyncToFirestore();
  }
}

// 模試リストを表示
function renderMockExamList() {
  if (!elements.mockExamList) return;

  if (state.mockExams.length === 0) {
    elements.mockExamList.innerHTML = '<p class="empty-message">まだ模試成績が登録されていません。</p>';
    if (elements.mockChartSection) {
      elements.mockChartSection.style.display = 'none';
    }
    return;
  }

  // 日付順にソート（新しい順）
  const sortedExams = [...state.mockExams].sort((a, b) =>
    new Date(b.date) - new Date(a.date)
  );

  elements.mockExamList.innerHTML = sortedExams.map(exam => {
    const percent = Math.round((exam.totalScore / exam.totalMax) * 100);
    const dateStr = formatDate(exam.date);

    let detailsHtml = '';
    const details = [];
    if (exam.rank) details.push(`順位: ${exam.rank}`);
    if (exam.deviation) details.push(`偏差値: ${exam.deviation}`);

    if (details.length > 0) {
      detailsHtml = `
        <div class="mock-exam-details">
          ${details.map(d => `<span class="mock-exam-detail-item">${d}</span>`).join('')}
        </div>
      `;
    }

    return `
      <div class="mock-exam-item" data-mock-id="${exam.id}">
        <div class="mock-exam-header">
          <div class="mock-exam-name">${escapeHtml(exam.name)}</div>
          <div class="mock-exam-actions">
            <button class="btn-edit" data-mock-id="${exam.id}" title="編集">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="btn-delete" data-mock-id="${exam.id}" title="削除">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="mock-exam-score">
          <span class="mock-exam-score-value">${exam.totalScore}</span>
          <span class="mock-exam-score-max">/ ${exam.totalMax}</span>
          <span class="mock-exam-percent">(${percent}%)</span>
        </div>
        <div class="mock-exam-date">${dateStr}</div>
        ${detailsHtml}
      </div>
    `;
  }).join('');

  // 編集・削除ボタンのイベント
  elements.mockExamList.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openMockModal(btn.dataset.mockId);
    });
  });

  elements.mockExamList.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      showDeleteMockConfirm(btn.dataset.mockId);
    });
  });

  // 成績推移グラフを表示
  if (state.mockExams.length >= 2 && elements.mockChartSection) {
    elements.mockChartSection.style.display = 'block';
    renderMockLineChart();
  } else if (elements.mockChartSection) {
    elements.mockChartSection.style.display = 'none';
  }
}

// 日付をフォーマット
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}

// 模試モーダルを開く
function openMockModal(mockId = null) {
  state.editingMockId = mockId;

  if (mockId) {
    // 編集モード
    const exam = state.mockExams.find(e => e.id === mockId);
    if (!exam) return;

    elements.mockModalTitle.textContent = '模試成績を編集';
    elements.mockNameInput.value = exam.name;
    elements.mockDateInput.value = exam.date;
    elements.mockTotalScoreInput.value = exam.totalScore;
    elements.mockTotalMaxInput.value = exam.totalMax;
    elements.mockHisshuScoreInput.value = exam.hisshuScore || '';
    elements.mockHisshuMaxInput.value = exam.hisshuMax || '';
    elements.mockIppanScoreInput.value = exam.ippanScore || '';
    elements.mockIppanMaxInput.value = exam.ippanMax || '';
    elements.mockRinjitsuScoreInput.value = exam.rinjitsuScore || '';
    elements.mockRinjitsuMaxInput.value = exam.rinjitsuMax || '';
    elements.mockRankInput.value = exam.rank || '';
    elements.mockDeviationInput.value = exam.deviation || '';
    elements.mockMemoInput.value = exam.memo || '';

    // 画像
    if (exam.image) {
      elements.mockImagePreviewImg.src = exam.image;
      elements.mockImagePreview.style.display = 'block';
      elements.mockImagePlaceholder.style.display = 'none';
    } else {
      elements.mockImagePreview.style.display = 'none';
      elements.mockImagePlaceholder.style.display = 'flex';
    }
  } else {
    // 新規作成モード
    elements.mockModalTitle.textContent = '模試成績を登録';
    elements.mockNameInput.value = '';
    elements.mockDateInput.value = new Date().toISOString().split('T')[0];
    elements.mockTotalScoreInput.value = '';
    elements.mockTotalMaxInput.value = '';
    elements.mockHisshuScoreInput.value = '';
    elements.mockHisshuMaxInput.value = '';
    elements.mockIppanScoreInput.value = '';
    elements.mockIppanMaxInput.value = '';
    elements.mockRinjitsuScoreInput.value = '';
    elements.mockRinjitsuMaxInput.value = '';
    elements.mockRankInput.value = '';
    elements.mockDeviationInput.value = '';
    elements.mockMemoInput.value = '';
    elements.mockImagePreview.style.display = 'none';
    elements.mockImagePlaceholder.style.display = 'flex';
  }

  elements.mockExamModal.style.display = 'flex';
}

// 模試モーダルを閉じる
function closeMockModal() {
  elements.mockExamModal.style.display = 'none';
  state.editingMockId = null;
}

// 模試を保存
function saveMockExam() {
  const name = elements.mockNameInput.value.trim();
  const date = elements.mockDateInput.value;
  const totalScore = parseInt(elements.mockTotalScoreInput.value);
  const totalMax = parseInt(elements.mockTotalMaxInput.value);

  if (!name || !date || isNaN(totalScore) || isNaN(totalMax)) {
    alert('模試名、受験日、総合点数、満点は必須です');
    return;
  }

  const examData = {
    name,
    date,
    totalScore,
    totalMax,
    hisshuScore: elements.mockHisshuScoreInput.value ? parseInt(elements.mockHisshuScoreInput.value) : null,
    hisshuMax: elements.mockHisshuMaxInput.value ? parseInt(elements.mockHisshuMaxInput.value) : null,
    ippanScore: elements.mockIppanScoreInput.value ? parseInt(elements.mockIppanScoreInput.value) : null,
    ippanMax: elements.mockIppanMaxInput.value ? parseInt(elements.mockIppanMaxInput.value) : null,
    rinjitsuScore: elements.mockRinjitsuScoreInput.value ? parseInt(elements.mockRinjitsuScoreInput.value) : null,
    rinjitsuMax: elements.mockRinjitsuMaxInput.value ? parseInt(elements.mockRinjitsuMaxInput.value) : null,
    rank: elements.mockRankInput.value.trim() || null,
    deviation: elements.mockDeviationInput.value ? parseFloat(elements.mockDeviationInput.value) : null,
    memo: elements.mockMemoInput.value.trim() || null,
    image: elements.mockImagePreview.style.display !== 'none' ? elements.mockImagePreviewImg.src : null
  };

  if (state.editingMockId) {
    // 編集
    const index = state.mockExams.findIndex(e => e.id === state.editingMockId);
    if (index !== -1) {
      state.mockExams[index] = { ...state.mockExams[index], ...examData };
    }
  } else {
    // 新規作成
    examData.id = 'mock-' + Date.now();
    examData.createdAt = new Date().toISOString();
    state.mockExams.push(examData);
  }

  saveMockExamsToStorage();
  renderMockExamList();
  closeMockModal();
}

// 画像選択を処理
function handleMockImageSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  // ファイルサイズチェック（2MB以下）
  if (file.size > 2 * 1024 * 1024) {
    alert('画像サイズは2MB以下にしてください');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    // 画像を圧縮
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxSize = 800;
      let width = img.width;
      let height = img.height;

      if (width > height && width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      } else if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      elements.mockImagePreviewImg.src = compressedDataUrl;
      elements.mockImagePreview.style.display = 'block';
      elements.mockImagePlaceholder.style.display = 'none';
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

// 画像を削除
function removeMockImage() {
  elements.mockImagePreviewImg.src = '';
  elements.mockImagePreview.style.display = 'none';
  elements.mockImagePlaceholder.style.display = 'flex';
}

// 模試削除確認
function showDeleteMockConfirm(mockId) {
  const exam = state.mockExams.find(e => e.id === mockId);
  if (!exam) return;

  elements.confirmModalTitle.textContent = '模試成績を削除';
  elements.confirmModalMessage.textContent = `「${exam.name}」を削除しますか？この操作は取り消せません。`;
  elements.confirmModalConfirm.onclick = () => {
    state.mockExams = state.mockExams.filter(e => e.id !== mockId);
    saveMockExamsToStorage();
    renderMockExamList();
    closeConfirmModal();
  };
  elements.confirmModal.style.display = 'flex';
}

// 成績推移グラフを描画
function renderMockLineChart() {
  if (!elements.mockLineChart || state.mockExams.length < 2) return;

  // 日付順にソート（古い順）
  const sortedExams = [...state.mockExams]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-10); // 最新10件

  const points = sortedExams.map((exam, index) => {
    const percent = Math.round((exam.totalScore / exam.totalMax) * 100);
    return { exam, percent, index };
  });

  const maxPercent = 100;
  const minPercent = 0;
  const chartHeight = 150;
  const chartWidth = elements.mockLineChart.clientWidth - 20;
  const padding = { top: 10, bottom: 30, left: 10, right: 10 };

  const getX = (index) => padding.left + (index / (points.length - 1)) * (chartWidth - padding.left - padding.right);
  const getY = (percent) => padding.top + ((maxPercent - percent) / (maxPercent - minPercent)) * (chartHeight - padding.top - padding.bottom);

  // SVGパス生成
  let pathD = points.map((p, i) => {
    const x = getX(i);
    const y = getY(p.percent);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  elements.mockLineChart.innerHTML = `
    <div class="line-chart-grid">
      <div class="line-chart-grid-line"><span class="line-chart-grid-label">100%</span></div>
      <div class="line-chart-grid-line"><span class="line-chart-grid-label">75%</span></div>
      <div class="line-chart-grid-line"><span class="line-chart-grid-label">50%</span></div>
      <div class="line-chart-grid-line"><span class="line-chart-grid-label">25%</span></div>
      <div class="line-chart-grid-line"><span class="line-chart-grid-label">0%</span></div>
    </div>
    <svg class="line-chart-svg" viewBox="0 0 ${chartWidth} ${chartHeight}" preserveAspectRatio="none">
      <path d="${pathD}" fill="none" stroke="var(--accent-color)" stroke-width="2"/>
      ${points.map(p => {
        const x = getX(p.index);
        const y = getY(p.percent);
        return `<circle cx="${x}" cy="${y}" r="4" fill="var(--accent-color)"/>`;
      }).join('')}
    </svg>
    <div class="line-chart-labels">
      ${points.map(p => `<span class="line-chart-label">${p.exam.date.slice(5)}</span>`).join('')}
    </div>
  `;
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

function clearSearchConditions() {
  // キーワード検索をクリア
  if (elements.searchKeyword) {
    elements.searchKeyword.value = '';
  }

  // 演習状態フィルタ - 全てON
  document.querySelectorAll('#practiceStatusFilter .filter-btn').forEach(btn => {
    btn.classList.add('active');
  });

  // 問題区分フィルタ - 全てON
  document.querySelectorAll('#questionTypeFilter .filter-btn').forEach(btn => {
    btn.classList.add('active');
  });

  // 回数選択フィルタ - 全てON
  document.querySelectorAll('#examFilter .filter-btn').forEach(btn => {
    btn.classList.add('active');
  });

  // 科目選択フィルタ - 全てON
  document.querySelectorAll('#subjectFilter .filter-btn').forEach(btn => {
    btn.classList.add('active');
  });
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
  updateLoginUI(); // ログイン状態を反映
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
  document.getElementById('clearConditionsBtn')?.addEventListener('click', clearSearchConditions);

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

  // まとめモーダル
  elements.summaryModalClose?.addEventListener('click', closeSummaryModal);
  elements.summaryModalBackdrop?.addEventListener('click', closeSummaryModal);

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
    // ログイン済みの表示
    const photoURL = state.currentUser.photoURL || '';
    const displayName = state.currentUser.displayName || 'ユーザー';
    const email = state.currentUser.email || '';

    elements.loginSection.innerHTML = `
      <div class="user-info">
        ${photoURL ? `<img src="${photoURL}" alt="" class="user-avatar" referrerpolicy="no-referrer">` : `
          <div class="user-avatar-placeholder">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        `}
        <div class="user-details">
          <div class="user-name">${displayName}</div>
          <div class="user-email">${email}</div>
        </div>
      </div>
      <div class="sync-status-bar">
        <div class="sync-indicator ${state.syncStatus}" id="syncIndicator">
          <svg class="sync-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 4v6h-6"></path>
            <path d="M1 20v-6h6"></path>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          <span>${getSyncStatusText()}</span>
        </div>
      </div>
      <button class="btn-logout" id="logoutBtn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        ログアウト
      </button>
    `;

    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
  } else {
    // 未ログインの表示（Googleアイコン付き）
    elements.loginSection.innerHTML = `
      <button class="btn-google-login" id="loginBtn">
        <svg class="google-icon" width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Googleでログイン
      </button>
      <p class="login-hint">ログインするとデータがクラウドに保存され、<br>別のデバイスでも使えるようになります</p>
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

      // まとめデータ
      summaryFavorites: state.summaryFavorites,
      recentSummaries: state.recentSummaries,

      // オリジナル問題データ
      originalDecks: state.originalDecks,

      // 模試成績データ
      mockExams: state.mockExams,

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

      // まとめデータを復元
      if (data.summaryFavorites) state.summaryFavorites = data.summaryFavorites;
      if (data.recentSummaries) state.recentSummaries = data.recentSummaries;

      // オリジナル問題データを復元
      if (data.originalDecks) state.originalDecks = data.originalDecks;

      // 模試成績データを復元
      if (data.mockExams) state.mockExams = data.mockExams;

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

// ===== キーワードまとめ機能 =====

// 問題にジャンプする関数（まとめHTMLから呼び出される）
function goToQuestion(questionId) {
  console.log('goToQuestion called:', questionId);

  // 問題IDをパース（例: "118-A002" → exam: "118", id: "118-A002"）
  const match = questionId.match(/^(\d+)-([A-D])(\d+)$/);
  if (!match) {
    console.error('Invalid question ID:', questionId);
    return;
  }

  const examNumber = match[1];

  // まとめモーダルを閉じる
  closeKeywordSummaryModal();

  // 過去問タブに切り替え
  switchTab('kakomon');

  // 該当する回の問題を読み込む
  const examSelect = document.getElementById('examSelect');
  if (examSelect) {
    examSelect.value = examNumber;
    loadQuestions();

    // 問題を検索して表示
    setTimeout(() => {
      const questionIndex = state.filteredQuestions.findIndex(q => q.id === questionId);
      if (questionIndex !== -1) {
        state.currentIndex = questionIndex;
        renderQuestion();
        state.currentView = 'quiz';
        updateViewDisplay();
      } else {
        showToast(`問題 ${questionId} が見つかりません`);
      }
    }, 300);
  }
}

// キーワードまとめモーダルを表示
function showKeywordSummaryModal(htmlFile) {
  let modal = document.getElementById('keywordSummaryModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'keywordSummaryModal';
    modal.className = 'keyword-summary-modal';
    modal.innerHTML = `
      <div class="keyword-summary-content">
        <button class="keyword-summary-close" onclick="closeKeywordSummaryModal()">×</button>
        <iframe id="keywordSummaryFrame" src="" frameborder="0"></iframe>
      </div>
    `;
    document.body.appendChild(modal);

    const style = document.createElement('style');
    style.textContent = `
      .keyword-summary-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 10000;
        justify-content: center;
        align-items: center;
      }
      .keyword-summary-modal.show { display: flex; }
      .keyword-summary-content {
        background: white;
        width: 90%;
        max-width: 900px;
        height: 90%;
        border-radius: 12px;
        position: relative;
        overflow: hidden;
      }
      .keyword-summary-close {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 36px;
        height: 36px;
        border: none;
        background: #f44336;
        color: white;
        font-size: 24px;
        border-radius: 50%;
        cursor: pointer;
        z-index: 10001;
      }
      #keywordSummaryFrame { width: 100%; height: 100%; border: none; }
    `;
    document.head.appendChild(style);
  }

  const iframe = document.getElementById('keywordSummaryFrame');
  iframe.src = `summaries/${htmlFile}`;
  iframe.onload = function() {
    iframe.contentWindow.goToQuestion = goToQuestion;
  };
  modal.classList.add('show');
}

// キーワードまとめモーダルを閉じる
function closeKeywordSummaryModal() {
  const modal = document.getElementById('keywordSummaryModal');
  if (modal) modal.classList.remove('show');
}

// グローバルスコープに公開
window.goToQuestion = goToQuestion;
window.showKeywordSummaryModal = showKeywordSummaryModal;
window.closeKeywordSummaryModal = closeKeywordSummaryModal;

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
