import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../../src/App";

function form() {
  return within(screen.getByRole("form", { name: "日報フォーム" }));
}

async function postReport(
  user: ReturnType<typeof userEvent.setup>,
  opts: { name: string; category?: string; content: string; date: string },
) {
  const f = form();
  await user.clear(f.getByLabelText("名前"));
  await user.type(f.getByLabelText("名前"), opts.name);
  if (opts.category) {
    await user.selectOptions(f.getByLabelText("カテゴリ"), opts.category);
  }
  await user.clear(f.getByLabelText("内容"));
  await user.type(f.getByLabelText("内容"), opts.content);
  const dateInput = f.getByLabelText("日付") as HTMLInputElement;
  await user.clear(dateInput);
  await user.type(dateInput, opts.date);
  await user.click(screen.getByRole("button", { name: "投稿" }));
}

describe("App 受入条件", () => {
  it("名前が空の場合、投稿ボタンが無効化される", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: "投稿" })).toBeDisabled();
  });

  it("投稿成功後、一覧に新しい日報が表示される", async () => {
    const user = userEvent.setup();
    render(<App />);
    await postReport(user, { name: "山田", content: "実装した", date: "2026-06-15" });
    const list = screen.getByLabelText("日報一覧");
    expect(within(list).getByText("山田")).toBeInTheDocument();
    expect(within(list).getByText("実装した")).toBeInTheDocument();
  });

  it("カテゴリフィルタで開発を選ぶと開発のみ表示される", async () => {
    const user = userEvent.setup();
    render(<App />);
    await postReport(user, { name: "山田", category: "開発", content: "dev", date: "2026-06-15" });
    await postReport(user, {
      name: "佐藤",
      category: "レビュー",
      content: "rev",
      date: "2026-06-14",
    });
    await user.selectOptions(screen.getByLabelText("カテゴリ", { selector: "#filter-category" }), "開発");
    const list = screen.getByLabelText("日報一覧");
    expect(within(list).getByText("dev")).toBeInTheDocument();
    expect(within(list).queryByText("rev")).not.toBeInTheDocument();
  });

  it("日付フィルタで絞り込んだ結果が正しく表示される", async () => {
    const user = userEvent.setup();
    render(<App />);
    await postReport(user, { name: "A", content: "old", date: "2026-06-01" });
    await postReport(user, { name: "B", content: "new", date: "2026-06-15" });
    await user.type(screen.getByLabelText("開始日"), "2026-06-10");
    const list = screen.getByLabelText("日報一覧");
    expect(within(list).getByText("new")).toBeInTheDocument();
    expect(within(list).queryByText("old")).not.toBeInTheDocument();
  });

  it("未来日を選択するとエラーメッセージが表示され投稿できない", async () => {
    const user = userEvent.setup();
    render(<App />);
    const f = form();
    await user.type(f.getByLabelText("名前"), "山田");
    await user.type(f.getByLabelText("内容"), "未来");
    const dateInput = f.getByLabelText("日付") as HTMLInputElement;
    await user.clear(dateInput);
    await user.type(dateInput, "2999-01-01");
    expect(screen.getByText("未来の日付は選択できません")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "投稿" })).toBeDisabled();
  });

  it("再マウントしても投稿済みの日報が残る（localStorage 永続化）", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await postReport(user, { name: "永続", content: "保存される", date: "2026-06-15" });
    unmount();
    render(<App />);
    expect(within(screen.getByLabelText("日報一覧")).getByText("永続")).toBeInTheDocument();
  });

  it("編集ボタンで投稿内容を編集できる", async () => {
    const user = userEvent.setup();
    render(<App />);
    await postReport(user, { name: "山田", content: "編集前", date: "2026-06-15" });
    await user.click(screen.getByRole("button", { name: "編集" }));
    const content = form().getByLabelText("内容");
    await user.clear(content);
    await user.type(content, "編集後");
    await user.click(screen.getByRole("button", { name: "更新" }));
    const list = screen.getByLabelText("日報一覧");
    expect(within(list).getByText("編集後")).toBeInTheDocument();
    expect(within(list).queryByText("編集前")).not.toBeInTheDocument();
  });

  it("削除ボタンで保存された投稿が削除される", async () => {
    const user = userEvent.setup();
    render(<App />);
    await postReport(user, { name: "山田", content: "削除対象", date: "2026-06-15" });
    await user.click(screen.getByRole("button", { name: "削除" }));
    expect(screen.queryByText("削除対象")).not.toBeInTheDocument();
    expect(screen.getByText("日報がありません")).toBeInTheDocument();
  });
});
