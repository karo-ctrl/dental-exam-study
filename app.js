// ===== 状態管理 =====
const state = {
  // モード
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
  currentImageIndex: 0
};

// ===== DOM要素 =====
const elements = {};

function initElements() {
  // ヘッダー
  elements.headerTitle = document.getElementById('headerTitle');
  elements.menuBtn = document.getElementById('menuBtn');
  elements.themeBtn = document.getElementById('themeBtn');
  elements.settingsBtn = document.getElementById('settingsBtn');

  // モードタブ
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
  elements.filterOptions = document.querySelectorAll('.filter-option');
  elements.fontDecrease = document.getElementById('fontDecrease');
  elements.fontIncrease = document.getElementById('fontIncrease');
  elements.fontSizeDisplay = document.getElementById('fontSizeDisplay');
  elements.resetProgress = document.getElementById('resetProgress');
  elements.progressText = document.getElementById('progressText');

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
  applyTheme(state.theme);
  applyFontSize();
  setupEventListeners();
  setMode(state.mode);
}

// ===== モード切替 =====
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
      elements.loadingState.style.display = 'none';
      elements.quizCard.style.display = 'block';
      renderExamList();
      if (state.currentExam) {
        filterQuestions();
        renderQuestion();
      }
      return;
    }

    const response = await fetch('./data/questions/all_questions.json');
    if (!response.ok) throw new Error('データの読み込みに失敗しました');

    state.allData = await response.json();
    console.log(`演習データ読み込み完了: ${state.allData.totalExams}試験, ${state.allData.totalQuestions}問`);

    renderExamList();

    if (state.allData.exams.length > 0) {
      const latestExam = state.allData.exams[state.allData.exams.length - 1];
      selectExam(latestExam.examId);
    }

    elements.loadingState.style.display = 'none';
    elements.quizCard.style.display = 'block';

  } catch (error) {
    console.error('データ読み込みエラー:', error);
    elements.loadingState.innerHTML = `<p>エラー: ${error.message}</p>`;
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
  renderQuestion();
  updateProgress();
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

function setFilter(filter) {
  state.filter = filter;
  state.currentIndex = 0;
  state.showingAnswer = false;
  state.selectedChoices.clear();

  elements.filterOptions.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });

  filterQuestions();
  renderQuestion();
  updateProgress();
  saveState();
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

  if (question.selectCount > 1) {
    elements.showAnswerBtn.textContent = `解答を見る (${question.selectCount}つ選択)`;
  } else {
    elements.showAnswerBtn.textContent = '解答を見る';
  }

  if (state.answeredCards.has(question.id)) {
    const answered = state.answeredCards.get(question.id);
    state.selectedChoices = new Set(answered.selected);
    state.showingAnswer = true;
    showAnswer();
  } else {
    state.showingAnswer = false;
    state.selectedChoices.clear();
  }

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
  elements.nextQuestionBtn.style.display = 'block';

  const allCorrect = correctLabels.every(l => state.selectedChoices.has(l)) &&
                     state.selectedChoices.size === correctLabels.length;

  state.answeredCards.set(question.id, {
    selected: Array.from(state.selectedChoices),
    correct: allCorrect
  });

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
  const examId = state.currentExam?.examId;
  if (!examId || !question.imageRef) {
    elements.imageThumbnails.innerHTML = '';
    return;
  }

  const imagePaths = parseImageRef(question.imageRef, examId);
  state.currentImages = imagePaths;

  if (imagePaths.length === 0) {
    elements.imageThumbnails.innerHTML = '<span style="color: var(--text-muted); font-size: 0.85rem;">画像を読み込めません</span>';
    return;
  }

  elements.imageThumbnails.innerHTML = imagePaths.map((path, idx) => `
    <img
      src="${path}"
      alt="問題画像 ${idx + 1}"
      class="image-thumbnail"
      data-index="${idx}"
      onerror="this.style.display='none'"
    >
  `).join('');

  // サムネイルクリックイベント
  elements.imageThumbnails.querySelectorAll('.image-thumbnail').forEach(img => {
    img.addEventListener('click', () => {
      openImageModal(parseInt(img.dataset.index));
    });
  });
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
    updateProgress();

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
    updateProgress();
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
    updateProgress();
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

// ===== 進捗管理 =====
function updateProgress() {
  let total, viewed;
  if (state.mode === 'quiz') {
    total = state.filteredQuestions.length;
    viewed = state.filteredQuestions.filter(q => state.answeredCards.has(q.id)).length;
  } else {
    total = state.flattenedCards.length;
    viewed = state.flattenedCards.filter(c => state.viewedCards.has(c.id)).length;
  }
  elements.progressText.textContent = `${viewed} / ${total}`;
}

function resetProgress() {
  const message = state.mode === 'quiz'
    ? '進捗をリセットしますか？\n回答履歴がすべて削除されます。'
    : '閲覧履歴をリセットしますか？';

  if (confirm(message)) {
    if (state.mode === 'quiz') {
      state.answeredCards.clear();
      state.showingAnswer = false;
      state.selectedChoices.clear();
      renderQuestion();
    }
    state.viewedCards.clear();
    updateProgress();
    saveState();
  }
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
  elements.settingsPanel.classList.add('open');
  elements.settingsOverlay.classList.add('open');
}

function closeSettings() {
  elements.settingsPanel.classList.remove('open');
  elements.settingsOverlay.classList.remove('open');
}

// ===== イベントリスナー =====
function setupEventListeners() {
  // モードタブ
  elements.modeTabs.forEach(tab => {
    tab.addEventListener('click', () => setMode(tab.dataset.mode));
  });

  // ヘッダーボタン
  elements.menuBtn.addEventListener('click', openSidebar);
  elements.themeBtn.addEventListener('click', cycleTheme);
  elements.settingsBtn.addEventListener('click', openSettings);

  // サイドバー
  elements.closeSidebarBtn.addEventListener('click', closeSidebar);
  elements.sidebarOverlay.addEventListener('click', closeSidebar);

  // 設定パネル
  elements.closeSettingsBtn.addEventListener('click', closeSettings);
  elements.settingsOverlay.addEventListener('click', closeSettings);

  // テーマ選択
  elements.themeOptions.forEach(btn => {
    btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
  });

  // フィルター選択
  elements.filterOptions.forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });

  // フォントサイズ
  elements.fontDecrease.addEventListener('click', () => changeFontSize(-10));
  elements.fontIncrease.addEventListener('click', () => changeFontSize(10));

  // 進捗リセット
  elements.resetProgress.addEventListener('click', resetProgress);

  // ナビゲーション
  elements.prevBtn.addEventListener('click', goToPrev);
  elements.nextBtn.addEventListener('click', goToNext);

  // お気に入り
  elements.quizFavoriteBtn?.addEventListener('click', toggleFavorite);
  elements.summaryFavoriteBtn?.addEventListener('click', toggleFavorite);

  // 解答表示（演習モード）
  elements.showAnswerBtn?.addEventListener('click', showAnswer);
  elements.nextQuestionBtn?.addEventListener('click', goToNext);

  // 画像モーダル
  elements.imageModalClose?.addEventListener('click', closeImageModal);
  elements.imageModalBackdrop?.addEventListener('click', closeImageModal);
  elements.imageModalPrev?.addEventListener('click', prevModalImage);
  elements.imageModalNext?.addEventListener('click', nextModalImage);

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
      case '1': case '2': case '3': case '4': case '5':
        if (state.mode === 'quiz') {
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

// ===== アプリ起動 =====
document.addEventListener('DOMContentLoaded', init);
