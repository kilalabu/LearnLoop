"use client";

import { Problem, Option } from "../types/Problem";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"; // RadioGroup -> Checkbox
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, CheckCircle2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface ProblemCardProps {
  problem: Problem;
  onChange: (updated: Problem) => void;
  onDelete: () => void;
}

/**
 * [Web Context]: 個別の問題を表示・編集するためのカードコンポーネント。
 * インライン編集を可能にし、変更があるたびに親に通知します (onChange)。
 * 複数選択（Multi-select）に対応するため、正解選択にはラジオボタンではなくチェックボックスを使用します。
 */
export function ProblemCard({ problem, onChange, onDelete }: ProblemCardProps) {
  // 問題文の更新
  const handleQuestionChange = (text: string) => {
    onChange({ ...problem, question: text });
  };

  // 解説の更新
  const handleExplanationChange = (text: string) => {
    onChange({ ...problem, explanation: text });
  };

  // 選択肢の更新
  const handleOptionChange = (optionId: string, text: string) => {
    const updatedOptions = problem.options.map((opt) =>
      opt.id === optionId ? { ...opt, text } : opt
    );
    onChange({ ...problem, options: updatedOptions });
  };

  // 正解の切り替え (複数選択対応)
  const handleCorrectChange = (optionId: string, isChecked: boolean) => {
    const updatedOptions = problem.options.map((opt) =>
      opt.id === optionId ? { ...opt, isCorrect: isChecked } : opt
    );
    onChange({ ...problem, options: updatedOptions });
  };

  // 選択肢の追加
  const addOption = () => {
    const newOption: Option = {
      id: uuidv4(),
      text: "",
      isCorrect: false,
    };
    onChange({ ...problem, options: [...problem.options, newOption] });
  };

  // 選択肢の削除
  const deleteOption = (optionId: string) => {
    const updatedOptions = problem.options.filter((opt) => opt.id !== optionId);
    onChange({ ...problem, options: updatedOptions });
  };

  return (
    <Card className="group border-2 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
            {problem.category}
          </div>
          {/* 正解数バッジ */}
          <div className="bg-muted px-2 py-1 rounded-full text-[10px] text-muted-foreground font-medium">
            正解数: {problem.options.filter(o => o.isCorrect).length}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="text-muted-foreground hover:text-destructive rounded-full"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 問題文の編集 */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">問題文</Label>
          <Textarea
            value={problem.question}
            onChange={(e) => handleQuestionChange(e.target.value)}
            className="min-h-[80px] bg-secondary/30 border-none focus-visible:ring-1 focus-visible:ring-primary text-base leading-relaxed"
            placeholder="問題文を入力してください..."
          />
        </div>

        {/* 選択肢の編集 */}
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">選択肢 (正解をチェックしてください)</Label>
          <div className="space-y-2">
            {problem.options.map((option) => (
              <div key={option.id} className="flex items-center gap-2 group/option">
                {/* 複数選択可能なチェックボックス */}
                <Checkbox
                  id={option.id}
                  checked={option.isCorrect}
                  onCheckedChange={(checked) => handleCorrectChange(option.id, checked === true)}
                  className="w-5 h-5 border-2 border-muted-foreground data-[state=checked]:border-success data-[state=checked]:bg-success data-[state=checked]:text-success-foreground"
                />

                <div className="flex-1 flex items-center gap-2 bg-secondary/20 p-2 rounded-xl border border-transparent hover:border-primary/20 transition-colors">
                  <Input
                    value={option.text}
                    onChange={(e) => handleOptionChange(option.id, e.target.value)}
                    className="h-8 border-none bg-transparent focus-visible:ring-0 text-sm"
                    placeholder="選択肢のテキスト..."
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteOption(option.id)}
                    className="opacity-0 group-hover/option:opacity-100 h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={addOption}
            className="w-full mt-2 border-2 border-dashed border-border hover:border-primary/30 hover:bg-primary/5 rounded-xl text-muted-foreground hover:text-primary transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            選択肢を追加
          </Button>
        </div>

        {/* 解説の編集 */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-success" />
            解説 / 補足
          </Label>
          <Textarea
            value={problem.explanation}
            onChange={(e) => handleExplanationChange(e.target.value)}
            className="min-h-[60px] bg-success/5 border-none focus-visible:ring-1 focus-visible:ring-success text-sm leading-relaxed"
            placeholder="正解の理由や補足情報を入力してください..."
          />
        </div>
      </CardContent>
    </Card>
  );
}
