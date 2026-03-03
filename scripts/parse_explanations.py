"""
解説MDファイルをパースし、all_questions.json に explanation フィールドを追加するスクリプト
"""

import json
import re
import os

EXPLANATION_DIR = os.path.join(os.path.dirname(__file__), '..', '..', '解説')
QUESTIONS_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'questions', 'all_questions.json')
QUESTIONS_COPY_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'questions', '118th.json')

MD_FILES = [
    '118A_解説.md',
    '118B_解説.md',
    '118C_解説.md',
    '118D_解説.md',
]


def md_id_to_json_id(md_id: str) -> str:
    """118A-1 -> 118-A001"""
    match = re.match(r'(\d+)([A-D])-(\d+)', md_id)
    if not match:
        raise ValueError(f"Invalid MD ID format: {md_id}")
    exam, section, num = match.groups()
    return f"{exam}-{section}{int(num):03d}"


def parse_md_file(filepath: str) -> dict[str, str]:
    """MDファイルから各問題の解説テキストを抽出する"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    explanations = {}

    # ## 問 118X-N で問題を分割
    question_pattern = re.compile(r'^## 問 (118[A-D]-\d+)', re.MULTILINE)
    matches = list(question_pattern.finditer(content))

    for i, match in enumerate(matches):
        md_id = match.group(1)
        start = match.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(content)
        question_block = content[start:end]

        # ### 解説 以降を抽出
        explanation_match = re.search(r'^### 解説\s*\n', question_block, re.MULTILINE)
        if explanation_match:
            explanation_text = question_block[explanation_match.end():]
            # 末尾の --- や空白を除去
            explanation_text = re.sub(r'\n---\s*$', '', explanation_text.rstrip())
            explanation_text = explanation_text.strip()

            json_id = md_id_to_json_id(md_id)
            explanations[json_id] = explanation_text

    return explanations


def main():
    # 全MDファイルから解説を収集
    all_explanations = {}
    for md_file in MD_FILES:
        filepath = os.path.join(EXPLANATION_DIR, md_file)
        if not os.path.exists(filepath):
            print(f"WARNING: {filepath} not found, skipping")
            continue
        explanations = parse_md_file(filepath)
        print(f"{md_file}: {len(explanations)} explanations parsed")
        all_explanations.update(explanations)

    print(f"\nTotal explanations: {len(all_explanations)}")

    # all_questions.json を読み込み（ネスト構造: data.exams[0].questions）
    with open(QUESTIONS_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    questions = data['exams'][0]['questions']

    # explanation フィールドを追加
    matched = 0
    unmatched_questions = []
    for q in questions:
        qid = q['id']
        if qid in all_explanations:
            q['explanation'] = all_explanations[qid]
            matched += 1
        else:
            unmatched_questions.append(qid)

    print(f"Matched: {matched}/{len(questions)}")
    if unmatched_questions:
        print(f"Unmatched questions ({len(unmatched_questions)}): {unmatched_questions[:10]}...")

    # 解説はあるがJSONにない問題
    json_ids = {q['id'] for q in questions}
    unmatched_explanations = [eid for eid in all_explanations if eid not in json_ids]
    if unmatched_explanations:
        print(f"Explanations without matching question ({len(unmatched_explanations)}): {unmatched_explanations[:10]}...")

    # 保存
    with open(QUESTIONS_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"\nSaved to {QUESTIONS_PATH}")

    # 118th.json も同期
    if os.path.exists(QUESTIONS_COPY_PATH):
        with open(QUESTIONS_COPY_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Saved to {QUESTIONS_COPY_PATH}")


if __name__ == '__main__':
    main()
