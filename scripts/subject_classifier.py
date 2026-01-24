"""
科目自動判別スクリプト v3
小児歯科のキーワードマッチングロジック
"""

import json
import re
from pathlib import Path

# ========== 小児歯科キーワード v3 ==========

# 強いキーワード（1つでマッチ）
PEDIATRIC_STRONG_KEYWORDS = [
    "小児", "乳歯", "乳幼児", "学童", "萌出", "混合歯列", "乳歯列",
    # 障害児関連
    "脳性麻痺", "Down症候群", "自閉スペクトラム症", "ADHD",
    # 保隙装置
    "バンドループ", "クラウンループ",
    # 追加キーワード
    "スポーツマウスガード", "von Harnack", "Turner症候群",
    "定型発達", "注意欠陥多動性障害",
]

# 通常キーワード（3つ以上でマッチ）
PEDIATRIC_NORMAL_KEYWORDS = [
    "保隙", "幼若永久歯", "咬合誘導", "予防填塞",
    "先天欠如", "癒合歯", "歯数異常", "乳歯冠", "既製金属冠",
    "フッ化物", "シーラント", "指しゃぶり", "哺乳",
    "外傷歯", "歯の外傷", "脱臼歯",
    "行動調整", "行動変容", "母乳栄養", "先天性外胚葉異形成症",
    "骨形成不全症", "歯齢", "骨年齢",
]

# 選択肢ラベル除外パターン
CHOICE_LABEL_PATTERNS = [
    r'[ａｂｃｄｅａｂｃｄｅ]\s*〜\s*[ａｂｃｄｅａｂｃｄｅ]',
    r'[ａｂｃｄｅａｂｃｄｅ]のいずれか',
    r'①〜⑤',
    r'ただし、①〜⑤は',
]

# 乳歯記号パターン
DECIDUOUS_PATTERNS = [
    r'第[一二]乳臼歯',
    r'乳[前中側切犬]歯',
    r'[ＡＢＣＤＥａｂｃｄｅ]{2,}[のにをはが]',
]

# 矯正歯科キーワード（12歳以上で除外判定用）
ORTHODONTIC_KEYWORDS = [
    "矯正歯科治療", "矯正装置", "セファロ", "歯列弓", "不正咬合",
    "アーチレングス", "叢生", "開咬", "過蓋咬合", "反対咬合",
]


def preprocess_text(text: str) -> str:
    """選択肢ラベルパターンを除外"""
    for pattern in CHOICE_LABEL_PATTERNS:
        text = re.sub(pattern, '', text)
    return text


def check_age_pattern(text: str):
    """年齢パターンをチェック"""
    # 〇歳の男児/女児
    match = re.search(r'(\d+)\s*歳の(男児|女児)', text)
    if match:
        return int(match.group(1)), "児"

    # 〇歳児
    match = re.search(r'(\d+)\s*歳児', text)
    if match:
        return int(match.group(1)), "児"

    # 〇か月の男児/女児
    match = re.search(r'(\d+)\s*か月の(男児|女児)', text)
    if match:
        return 0, "乳児"

    return None, None


def is_pediatric(question_text: str, choices: list) -> tuple[bool, list]:
    """
    小児歯科かどうかを判定
    Returns: (is_pediatric, matched_keywords)
    """
    # テキストを結合
    text = question_text
    for choice in choices:
        if isinstance(choice, dict):
            text += " " + choice.get("text", "")
        else:
            text += " " + str(choice)

    # 前処理
    processed_text = preprocess_text(text)

    matched = []
    all_keywords = PEDIATRIC_STRONG_KEYWORDS + PEDIATRIC_NORMAL_KEYWORDS

    # キーワードマッチ
    for kw in all_keywords:
        if kw in processed_text:
            matched.append(kw)

    # 強いキーワード1つでマッチ
    for kw in PEDIATRIC_STRONG_KEYWORDS:
        if kw in processed_text:
            # 脳性麻痺は成人でも出題されるので、年齢チェック
            if kw == "脳性麻痺":
                age, age_type = check_age_pattern(processed_text)
                if age is not None and age >= 18:
                    continue
            return True, matched

    # 年齢パターンマッチ
    age, age_type = check_age_pattern(processed_text)
    if age is not None:
        matched.append(f"年齢({age}歳)")

        # 11歳以下は強いマッチ
        if age <= 11:
            return True, matched

        # 12歳以上は矯正キーワードがなければ、小児的内容でマッチ
        if age <= 14:
            has_ortho = any(kw in processed_text for kw in ORTHODONTIC_KEYWORDS)
            if not has_ortho:
                pediatric_hints = ["外傷", "先天", "発育", "欠如", "萌出遅延"]
                if any(hint in processed_text for hint in pediatric_hints):
                    return True, matched

    # 乳歯記号パターンマッチ
    for pattern in DECIDUOUS_PATTERNS:
        if re.search(pattern, processed_text):
            matched.append("乳歯記号")
            return True, matched

    # 通常キーワード3つ以上でマッチ
    if len(matched) >= 3:
        return True, matched

    return False, matched


def determine_category(section: str, number: int, image_ref) -> str:
    """
    種別を判定
    - 各年度のA〜D問題の最初の20問 → 必修
    - 画像あり → 臨実
    - それ以外 → 一般
    """
    # 最初の20問は必修
    if number <= 20:
        return "必修"

    # 画像ありは臨実
    if image_ref:
        return "臨実"

    # それ以外は一般
    return "一般"


def process_all_questions():
    """全過去問を処理"""
    base_path = Path(__file__).parent.parent / "data" / "questions"

    # 各年度のJSONを読み込んで処理
    all_exams = []
    total_questions = 0
    pediatric_count = 0

    for year in range(100, 119):
        json_path = base_path / f"{year}th.json"
        if not json_path.exists():
            print(f"  {year}回: ファイルなし")
            continue

        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        exam_pediatric = 0
        questions = data.get("questions", [])

        for q in questions:
            question_text = q.get("questionText", "")
            choices = q.get("choices", [])
            section = q.get("section", "")
            number = q.get("number", 0)
            image_ref = q.get("imageRef")

            # 種別を判定
            category = determine_category(section, number, image_ref)
            q["category"] = category

            # 小児歯科を判定
            is_ped, matched = is_pediatric(question_text, choices)
            if is_ped:
                q["subject"] = "小児歯科"
                exam_pediatric += 1
                pediatric_count += 1
            else:
                # 既存のsubjectがあればそのまま、なければ空欄
                if not q.get("subject"):
                    q["subject"] = ""

            # fieldは空欄のまま
            if not q.get("field"):
                q["field"] = ""

            total_questions += 1

        # 元のJSONを更新（個別ファイル）
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"  {year}回: {len(questions)}問 (小児歯科: {exam_pediatric}問)")

        # all_questions用のデータを構築
        all_exams.append({
            "examId": str(year),
            "examName": data.get("examName", f"第{year}回歯科医師国家試験"),
            "totalQuestions": len(questions),
            "questions": questions
        })

    # all_questions.json を更新
    all_questions_data = {
        "totalExams": len(all_exams),
        "totalQuestions": total_questions,
        "exams": all_exams
    }

    all_questions_path = base_path / "all_questions.json"
    with open(all_questions_path, "w", encoding="utf-8") as f:
        json.dump(all_questions_data, f, ensure_ascii=False, indent=2)

    print(f"\n合計: {total_questions}問 (小児歯科: {pediatric_count}問)")
    print(f"all_questions.json を更新しました")

    return total_questions, pediatric_count


if __name__ == "__main__":
    print("=" * 60)
    print("科目自動判別スクリプト v3")
    print("=" * 60)
    print("\n処理中...")
    process_all_questions()
    print("\n完了！")
