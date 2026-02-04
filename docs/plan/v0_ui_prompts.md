# v0 UIデザイン指示書 - 学習自動化システム

個人専用の学習アプリ。忘却曲線に基づいた復習スケジュールで問題を出題し、知識の定着を最大化する。

---

## 0. デザインシステム（最初に作成）

### v0 プロンプト

```
Create a design system for a modern learning/quiz app called "LearnLoop".

**Design Tokens:**
- Define a cohesive color palette with:
  - Brand/Primary color (for CTAs, active states, branding)
  - Secondary/Accent color
  - Success semantic color (for correct answers)
  - Error semantic color (for incorrect answers)
  - Neutral grays for backgrounds, borders, text
- Support both light and dark mode

**Typography:**
- Heading scales (h1-h4)
- Body text, caption, label sizes
- Font family: modern sans-serif (e.g., Inter)
- Japanese text support with appropriate font fallbacks

**Spacing & Layout:**
- Consistent spacing scale (4px base)
- Border radius tokens (small, medium, large)
- Container max-widths for mobile-first design

**Components to define:**
1. Button (primary, secondary, outline, danger, disabled states)
2. Card (elevated, outlined variants)
3. Checkbox (with smooth animation, selected/unselected states)
4. Input/Textarea (with focus states)
5. Progress bar
6. Badge/Tag
7. Toast/Snackbar (success, error variants)

**Style:**
- Modern, minimal aesthetic
- Subtle shadows and glassmorphism options
- Smooth micro-animations
- Mobile-first responsive approach

Output a design system overview showing all tokens and component variants.
```

---

## 全体デザイン方針

- **スタイル**: モダン・ミニマル、ダークモード対応
- **統一感**: 上記デザインシステムに基づいて全画面を作成
- **対応**: モバイルファースト

---

## 画面一覧

1. [ホーム画面](#1-ホーム画面)
2. [学習画面](#2-学習画面問題表示)
3. [解説画面](#3-解説画面)
4. [管理画面](#4-管理画面問題生成)
5. [生成結果プレビュー](#5-生成結果プレビュー画面)

---

## 1. ホーム画面

### v0 プロンプト

```
Using the design system created earlier, create a mobile-first home screen for the "LearnLoop" app.

**Header:**
- App name "LearnLoop" with brand color styling
- Settings icon (top right)

**Main Content:**
- Large card showing "今日の問題" (Today's Questions)
  - Big number showing pending question count (e.g., "12")
  - Subtext: "問 待機中" 
  - Progress ring around the number showing completion rate
- Primary button: "学習を始める" - full width

**Bottom Section:**
- Stats row with 3 mini cards:
  - "連続日数" (streak): number + fire icon
  - "正答率" (accuracy): percentage + circular progress
  - "総問題数" (total): count + book icon

**Requirements:**
- Use design system tokens for all colors, spacing, typography
- Maintain visual consistency with the established style
- Japanese text
```

---

## 2. 学習画面（問題表示）

### v0 プロンプト

```
Using the design system, create a quiz question screen for the learning app.

**Header:**
- Progress indicator: "3 / 10" with progress bar
- Close (X) button top left
- Genre tag below progress (e.g., "Docker")

**Question Area:**
- Question text in a card component
- Large, readable text

**Answer Options:**
- 4-5 checkbox options (multiple select allowed)
- Each option is a card with checkbox and option text (A, B, C, D prefix)
- Clear visual distinction between selected and unselected states

**Bottom:**
- Primary button: "回答を確認する" (Check Answer)
  - Disabled state when nothing selected

**Requirements:**
- Use design system checkbox and button components
- Smooth selection animations
- Japanese UI text
- Clear visual hierarchy
```

---

## 3. 解説画面

### v0 プロンプト

```
Using the design system, create an answer result and explanation screen.

**Header:**
- Same progress indicator as question screen "3 / 10"
- Back button

**Result Banner:**
- If correct: Success-colored banner with check icon, "正解！" text
- If incorrect: Error-colored banner with X icon, "不正解" text

**Answer Review:**
- Show all options with their correct/incorrect state:
  - Correct answer: success color styling with check mark
  - User's wrong selection: error color styling with X mark
  - Other options: neutral styling

**Explanation Section:**
- Card with heading "解説"
- Explanation text with good line-height
- "ソースを見る" link at bottom

**Bottom:**
- Primary button: "次の問題へ" (Next Question)

**Requirements:**
- Use semantic colors from design system for success/error states
- Readable explanation text
- Japanese text
```

---

## 4. 管理画面（問題生成）

### v0 プロンプト

```
Using the design system, create an admin screen for generating quiz questions.

**Header:**
- Title: "問題を生成" (Generate Questions)
- Back button

**Form:**
- Genre/Category dropdown selector
  - Options: "Docker", "Kubernetes", "Database", etc.

- Large textarea for source text input
  - Placeholder: "学習したい内容をペースト..."
  - Minimum 6 lines visible
  - Character count in corner (e.g., "0 / 5000")

**Generate Button:**
- Primary button: "AIで問題を生成" with sparkle icon
- Loading state: spinner + "生成中..."

**Tips Section:**
- Info card at bottom
- "💡 200〜2000文字程度のテキストが最適です"

**Requirements:**
- Use design system input/textarea and button components
- Clean form layout
- Subtle animations on focus
- Japanese UI
```

---

## 5. 生成結果プレビュー画面

### v0 プロンプト

```
Using the design system, create a preview screen for AI-generated quiz questions.

**Header:**
- Title: "生成された問題" (Generated Questions)
- Subtitle: "3問生成されました"
- Close (X) button

**Question List:**
- Scrollable list of generated question cards
- Each card shows:
  - Question number badge (Q1, Q2, Q3...)
  - Question text (truncated if long)
  - Number of options: "選択肢: 4つ"
  - Expand/collapse chevron
  
- Expanded state shows:
  - Full question text
  - All options with correct ones marked (success color check)
  - Explanation preview (first 100 chars)
  - Danger button: "削除" (delete) with trash icon

**Bottom Actions:**
- Secondary button: "キャンセル" (Cancel) - left
- Primary button: "保存する" (Save) - right

**Requirements:**
- Use design system card and button components
- Smooth expand/collapse animation
- Japanese text
```
