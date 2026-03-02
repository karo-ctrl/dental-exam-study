#!/usr/bin/env python3
"""
dental_exam_db_fixed_copy.csv から118回データを抽出し、
アプリ用JSONに変換するスクリプト。

使用方法:
  python scripts/convert_csv.py \
    --csv "../data/過去問DB/dental_exam_db_fixed_copy.csv" \
    --figures-dir "../data/本文中図表" \
    --out-dir "./data/questions"
"""

import argparse
import csv
import json
import os
import re
import sys
from pathlib import Path


def parse_answer(answer_str, fmt):
    """
    answer列を correctAnswers 配列に変換。
    例: "E" → ["e"], "BD" → ["b", "d"], "ACE" → ["a", "c", "e"]
    Calc/Seq形式はそのまま文字列を配列に入れる。
    """
    if not answer_str or answer_str.strip() == "":
        return []
    answer_str = answer_str.strip()
    # X1〜X4: アルファベット1文字ずつ分割
    if re.match(r'^X\d$', fmt or ''):
        return [c.lower() for c in answer_str if c.isalpha()]
    # Calc, Seq, その他: そのまま
    return [answer_str]


def parse_image_refs(image_refs_str):
    """
    image_refs列（JSON配列文字列）をパースしてリストを返す。
    例: '["118A-7"]' → ["118A-7"]
    例: '["118A-21A","118A-21B"]' → ["118A-21A","118A-21B"]
    空配列や空文字はNoneを返す。
    """
    if not image_refs_str or image_refs_str.strip() in ('', '[]', '""', "''"):
        return None
    try:
        refs = json.loads(image_refs_str)
        if isinstance(refs, list) and len(refs) > 0:
            return refs
    except json.JSONDecodeError:
        pass
    return None


def parse_select_count(fmt):
    """
    format列をselectCountに変換。
    X1→1, X2→2, X3→3, X4→4, その他→0
    """
    if fmt and re.match(r'^X(\d)$', fmt):
        return int(fmt[1])
    return 0


def build_choices(row):
    """
    a,b,c,d,e,f,g 列から空でない選択肢リストを構築。
    """
    labels = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    choices = []
    for label in labels:
        text = row.get(label, '').strip()
        if text:
            choices.append({'label': label, 'text': text})
    return choices


def build_figure_map(figures_dir, exam_number):
    """
    本文中図表フォルダをスキャンして、問題IDごとに図表画像パスのマップを作成。
    例: {("A", 7): ["images/figures/118/118A_Q7_p16.png"], ...}
    """
    figure_map = {}
    base = Path(figures_dir)
    if not base.exists():
        print(f"[WARNING] 本文中図表フォルダが見つかりません: {figures_dir}", file=sys.stderr)
        return figure_map

    # パターン: 118A_Q7_p16.png
    pattern = re.compile(
        rf'^{exam_number}([A-D])_Q(\d+)_p\d+\.png$',
        re.IGNORECASE
    )
    # 各セクションフォルダ(118A, 118B, ...)をスキャン
    for section_dir in sorted(base.iterdir()):
        if not section_dir.is_dir():
            continue
        for file in sorted(section_dir.iterdir()):
            m = pattern.match(file.name)
            if m:
                section = m.group(1).upper()
                number = int(m.group(2))
                key = (section, number)
                rel_path = f"images/figures/{exam_number}/{file.name}"
                figure_map.setdefault(key, []).append(rel_path)

    return figure_map


def convert_row(row, figure_map):
    """
    CSVの1行をJSONオブジェクトに変換。
    """
    exam_number = row['exam_number'].strip()
    section = row['section'].strip().upper()
    number = int(row['question_number'].strip())
    fmt = row.get('format', '').strip()

    # ID: "118-A007" 形式（既存アプリのスキーマに合わせてゼロ埋め）
    question_id = f"{exam_number}-{section}{str(number).zfill(3)}"

    # 画像参照
    has_image = row.get('has_image', '').strip().upper() == 'TRUE'
    image_ref = None
    if has_image:
        refs = parse_image_refs(row.get('image_refs', ''))
        if refs:
            image_ref = ', '.join(refs)

    # 本文中図表
    figure_refs = figure_map.get((section, number))

    # 正答率
    correct_rate_str = row.get('全国正答率', '').strip()
    try:
        correct_rate = float(correct_rate_str) if correct_rate_str else None
    except ValueError:
        correct_rate = None

    obj = {
        'id': question_id,
        'section': section,
        'number': number,
        'questionText': row.get('question_text', '').strip(),
        'selectCount': parse_select_count(fmt),
        'choices': build_choices(row),
        'correctAnswers': parse_answer(row.get('answer', ''), fmt),
        'imageRef': image_ref,
        'relatedLinks': None,
        'category': row.get('領域', '').strip() or '',
        'subject': row.get('科目', '').strip() or '',
        'field': row.get('分野', '').strip() or '',
        'correctRate': correct_rate,
    }

    if figure_refs:
        obj['figureRefs'] = figure_refs

    return obj


def main():
    parser = argparse.ArgumentParser(description='CSV→JSON変換スクリプト')
    parser.add_argument('--csv', required=True, help='入力CSVファイルパス')
    parser.add_argument('--figures-dir', required=True, help='本文中図表フォルダパス')
    parser.add_argument('--out-dir', required=True, help='出力JSONフォルダパス')
    parser.add_argument('--exam-number', default='118', help='取り込む試験回 (デフォルト: 118)')
    args = parser.parse_args()

    exam_number = args.exam_number
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    # 本文中図表マップを構築
    print(f"[1/3] 本文中図表をスキャン中...")
    figure_map = build_figure_map(args.figures_dir, exam_number)
    print(f"      {len(figure_map)} 問題に図表画像あり")

    # CSV読み込み・変換
    print(f"[2/3] CSV読み込み中: {args.csv}")
    questions = []
    skipped = 0

    with open(args.csv, encoding='utf-8-sig', newline='') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get('exam_number', '').strip() != exam_number:
                continue
            q_text = row.get('question_text', '').strip()
            if not q_text:
                skipped += 1
                continue
            questions.append(convert_row(row, figure_map))

    print(f"      {len(questions)} 問変換完了 (スキップ: {skipped})")

    # セクション別集計
    section_counts = {}
    for q in questions:
        s = q['section']
        section_counts[s] = section_counts.get(s, 0) + 1
    for s in sorted(section_counts):
        print(f"      セクション{s}: {section_counts[s]} 問")

    # ソート (section → number)
    section_order = {'A': 0, 'B': 1, 'C': 2, 'D': 3}
    questions.sort(key=lambda q: (section_order.get(q['section'], 9), q['number']))

    # 118th.json 出力
    exam_obj = {
        'examId': exam_number,
        'examName': f'第{exam_number}回歯科医師国家試験',
        'totalQuestions': len(questions),
        'questions': questions,
    }

    out_118 = out_dir / f'{exam_number}th.json'
    with open(out_118, 'w', encoding='utf-8') as f:
        json.dump(exam_obj, f, ensure_ascii=False, indent=2)
    print(f"[3/3] 出力: {out_118}")

    # all_questions.json 出力
    all_obj = {
        'totalExams': 1,
        'totalQuestions': len(questions),
        'exams': [exam_obj],
    }
    out_all = out_dir / 'all_questions.json'
    with open(out_all, 'w', encoding='utf-8') as f:
        json.dump(all_obj, f, ensure_ascii=False, indent=2)
    print(f"       出力: {out_all}")

    print("\n完了!")
    print(f"  総問題数: {len(questions)}")
    print(f"  図表付き: {sum(1 for q in questions if q.get('figureRefs'))}")
    print(f"  画像付き: {sum(1 for q in questions if q.get('imageRef'))}")


if __name__ == '__main__':
    main()
