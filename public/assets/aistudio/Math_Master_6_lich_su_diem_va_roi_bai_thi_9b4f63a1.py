
import tkinter as tk
from tkinter import messagebox
import random
import json
import os
import hashlib
from datetime import date, timedelta, datetime

# ==========================================
# MATH MASTER 6 - VERSION 2.0
# ==========================================

FILE = "math_master_data.json"

BG = "#101827"
CARD = "#1E293B"
BLUE = "#3B82F6"
GREEN = "#22C55E"
YELLOW = "#FACC15"
WHITE = "#FFFFFF"
RED = "#EF4444"
PURPLE = "#9333EA"

root = tk.Tk()
root.title("MATH MASTER 6 - Math RPG")
root.geometry("1000x720")
root.minsize(800, 600)
root.configure(bg=BG)

users = {}
current_user = None
profile = None

questions = []
question_index = 0
correct_count = 0
selected_grade = 6
selected_level = "Bình thường"

remaining_seconds = 25 * 60
timer_job = None
quiz_active = False
hint_used_for_question = False

HINT_PRICES = [
    10000, 50000, 75000, 100000, 150000,
    250000, 500000, 1000000, 2000000, 10000000
]

DAILY_REWARDS = [
    ("money", 50),
    ("money", 100),
    ("diamond", 1),
    ("money", 200),
    ("money", 250),
    ("diamond", 2),
    ("money", 400)
]


# ==========================================
# LƯU DỮ LIỆU
# ==========================================

def load_data():
    global users

    if os.path.exists(FILE):
        try:
            with open(FILE, "r", encoding="utf-8") as f:
                users = json.load(f)
        except:
            users = {}
    else:
        users = {}


def save_data():
    with open(FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, ensure_ascii=False, indent=4)


def password_hash(password):
    return hashlib.sha256(password.encode()).hexdigest()


def new_profile(password):
    return {
        "password": password_hash(password),
        "money": 0,
        "diamonds": 0,
        "xp": 0,
        "level": 0,
        "streak": 0,
        "last_date": "",
        "claimed_date": "",
        "hint_date": "",
        "hint_count": 0,
        "total_games": 0,
        "total_correct": 0,
        "history": [],
        "auto_freeze": True
    }


def refresh_profile():
    profile["level"] = min(1000000, profile["xp"] // 100)


# ==========================================
# ĐĂNG NHẬP VÀ ĐĂNG KÝ
# ==========================================

def register_screen():
    clear_screen()

    heading("ĐĂNG KÝ TÀI KHOẢN")

    frame = make_card(root)
    frame.pack(pady=25)

    tk.Label(
        frame, text="Tên tài khoản",
        bg=CARD, fg=WHITE, font=("Arial", 13)
    ).pack(anchor="w")

    name_entry = tk.Entry(frame, font=("Arial", 15), width=30)
    name_entry.pack(pady=10)

    tk.Label(
        frame, text="Mật khẩu",
        bg=CARD, fg=WHITE, font=("Arial", 13)
    ).pack(anchor="w")

    pass_entry = tk.Entry(
        frame, font=("Arial", 15),
        width=30, show="*"
    )
    pass_entry.pack(pady=10)

    def register():
        name = name_entry.get().strip()
        password = pass_entry.get()

        if len(name) < 3 or len(password) < 4:
            messagebox.showwarning(
                "Thông báo",
                "Tên cần ít nhất 3 ký tự, "
                "mật khẩu ít nhất 4 ký tự."
            )
            return

        if name in users:
            messagebox.showerror(
                "Lỗi", "Tên tài khoản đã tồn tại!"
            )
            return

        users[name] = new_profile(password)
        save_data()

        messagebox.showinfo(
            "Thành công", "Đăng ký thành công!"
        )

        login_screen()

    make_button(frame, "ĐĂNG KÝ", register, GREEN).pack(pady=20)
    make_button(root, "QUAY LẠI", login_screen).pack()


def login_screen():
    clear_screen()

    heading("MATH MASTER 6", 30, YELLOW)

    tk.Label(
        root,
        text="Đăng nhập để lưu tiền, kim cương và cấp độ",
        bg=BG, fg=WHITE, font=("Arial", 13)
    ).pack(pady=10)

    frame = make_card(root)
    frame.pack(pady=25)

    tk.Label(
        frame, text="Tên tài khoản",
        bg=CARD, fg=WHITE
    ).pack(anchor="w")

    name_entry = tk.Entry(frame, font=("Arial", 15), width=30)
    name_entry.pack(pady=10)

    tk.Label(
        frame, text="Mật khẩu",
        bg=CARD, fg=WHITE
    ).pack(anchor="w")

    pass_entry = tk.Entry(
        frame, font=("Arial", 15),
        width=30, show="*"
    )
    pass_entry.pack(pady=10)

    def login():
        global current_user, profile

        name = name_entry.get().strip()
        password = pass_entry.get()

        if name not in users:
            messagebox.showerror(
                "Lỗi", "Không tìm thấy tài khoản!"
            )
            return

        if users[name]["password"] != password_hash(password):
            messagebox.showerror(
                "Lỗi", "Mật khẩu không đúng!"
            )
            return

        current_user = name
        profile = users[name]
        profile.setdefault("history", [])

        refresh_streak()
        refresh_profile()
        save_data()
        home_screen()

    make_button(frame, "ĐĂNG NHẬP", login, GREEN).pack(pady=15)
    make_button(root, "TẠO TÀI KHOẢN", register_screen, PURPLE).pack(pady=8)


# ==========================================
# CHUỖI ĐĂNG NHẬP VÀ FREEZE
# ==========================================

def refresh_streak():
    today = date.today()
    last = profile.get("last_date", "")

    if not last:
        profile["streak"] = 1
        profile["last_date"] = today.isoformat()
        return

    last_day = date.fromisoformat(last)
    gap = (today - last_day).days

    if gap <= 0:
        return

    if gap == 1:
        profile["streak"] += 1

    else:
        missed = gap - 1

        # Tự động dùng 1 kim cương cho mỗi ngày bị bỏ lỡ
        # nếu bật chế độ đóng băng.
        if profile.get("auto_freeze", True):
            used = min(missed, profile["diamonds"])
            profile["diamonds"] -= used
            missed -= used

        if missed > 0:
            profile["streak"] = 1
        else:
            profile["streak"] += gap

    profile["last_date"] = today.isoformat()


# ==========================================
# GIAO DIỆN CƠ BẢN
# ==========================================

def clear_screen():
    global timer_job

    if timer_job is not None:
        try:
            root.after_cancel(timer_job)
        except:
            pass

    timer_job = None

    for widget in root.winfo_children():
        widget.destroy()


def heading(text, size=27, color=YELLOW):
    tk.Label(
        root, text=text,
        font=("Arial", size, "bold"),
        fg=color, bg=BG
    ).pack(pady=22)


def make_card(parent):
    return tk.Frame(
        parent, bg=CARD,
        padx=30, pady=25
    )


def make_button(parent, text, command, color=BLUE):
    return tk.Button(
        parent,
        text=text,
        command=command,
        font=("Arial", 13, "bold"),
        bg=color,
        fg=WHITE,
        activebackground=color,
        activeforeground=WHITE,
        relief="flat",
        cursor="hand2",
        padx=20,
        pady=11
    )


# ==========================================
# TRANG CHỦ
# ==========================================

def home_screen():
    clear_screen()

    heading("🧠 MATH MASTER 6", 31)

    refresh_profile()

    stats = tk.Frame(root, bg=BG)
    stats.pack(pady=5)

    for text, color in [
        (f"🪙 {profile['money']:,}", YELLOW),
        (f"💎 {profile['diamonds']:,}", BLUE),
        (f"⭐ {profile['xp']:,} XP", GREEN),
        (f"LV {profile['level']}", PURPLE)
    ]:
        tk.Label(
            stats, text=text,
            font=("Arial", 14, "bold"),
            fg=color, bg=CARD,
            padx=15, pady=12
        ).pack(side="left", padx=5)

    tk.Label(
        root,
        text=f"Xin chào {current_user}!",
        font=("Arial", 16, "bold"),
        fg=WHITE, bg=BG
    ).pack(pady=12)

    tk.Label(
        root,
        text=f"🔥 Chuỗi đăng nhập: {profile['streak']} ngày",
        font=("Arial", 13),
        fg=YELLOW, bg=BG
    ).pack()

    box = tk.Frame(root, bg=BG)
    box.pack(pady=18)

    make_button(
        box, "📚 THI THỬ",
        test_screen
    ).pack(fill="x", pady=5)

    make_button(
        box, "🎮 CHƠI GAME TOÁN HỌC",
        lambda: start_quiz(6, "Bình thường"),
        PURPLE
    ).pack(fill="x", pady=5)

    make_button(
        box, "🎁 PHẦN THƯỞNG HẰNG NGÀY",
        daily_screen, GREEN
    ).pack(fill="x", pady=5)

    make_button(
        box, "🛒 CỬA HÀNG GỢI Ý",
        shop_screen, "#D97706"
    ).pack(fill="x", pady=5)

    make_button(
        box, "📊 THỐNG KÊ",
        statistics_screen
    ).pack(fill="x", pady=5)

    make_button(
        box, "📜 LỊCH SỬ LÀM BÀI",
        history_screen, "#0D9488"
    ).pack(fill="x", pady=5)

    make_button(
        box, "🚪 ĐĂNG XUẤT",
        logout, RED
    ).pack(fill="x", pady=5)


# ==========================================
# PHẦN THƯỞNG HẰNG NGÀY
# ==========================================

def daily_screen():
    clear_screen()

    heading("🎁 PHẦN THƯỞNG HẰNG NGÀY")

    frame = make_card(root)
    frame.pack(pady=10)

    for i, (kind, amount) in enumerate(DAILY_REWARDS):
        if kind == "money":
            reward = f"{amount} tiền"
        else:
            reward = f"{amount} kim cương"

        tk.Label(
            frame,
            text=f"Ngày {i+1}: {reward}",
            bg=CARD, fg=YELLOW,
            font=("Arial", 14)
        ).pack(anchor="w", pady=6)

    def claim():
        today = date.today().isoformat()

        if profile["claimed_date"] == today:
            messagebox.showinfo(
                "Thông báo", "Bạn đã nhận quà hôm nay!"
            )
            return

        day = (profile["streak"] - 1) % 7
        kind, amount = DAILY_REWARDS[day]

        if kind == "money":
            profile["money"] += amount
        else:
            profile["diamonds"] += amount

        profile["claimed_date"] = today

        save_data()

        messagebox.showinfo(
            "Nhận thưởng",
            f"Bạn nhận được {amount} "
            f"{'tiền' if kind == 'money' else 'kim cương'}!"
        )
        daily_screen()

    make_button(
        root, "🎁 NHẬN THƯỞNG",
        claim, GREEN
    ).pack(pady=15)

    make_button(root, "QUAY LẠI", home_screen).pack()


# ==========================================
# CỬA HÀNG GỢI Ý
# ==========================================

def shop_screen():
    clear_screen()

    heading("🛒 CỬA HÀNG GỢI Ý")

    if profile.get("hint_date") != date.today().isoformat():
        profile["hint_date"] = date.today().isoformat()
        profile["hint_count"] = 0
        save_data()

    frame = make_card(root)
    frame.pack(pady=10)

    tk.Label(
        frame,
        text=f"Tiền hiện có: {profile['money']:,}",
        bg=CARD, fg=YELLOW,
        font=("Arial", 16, "bold")
    ).pack(pady=10)

    for i, price in enumerate(HINT_PRICES):
        tk.Label(
            frame,
            text=f"Lần {i+1}: {price:,} tiền",
            bg=CARD, fg=WHITE,
            font=("Arial", 12)
        ).pack(anchor="w", pady=3)

    tk.Label(
        root,
        text=f"Hôm nay đã mua: {profile['hint_count']}/10 lần",
        bg=BG, fg=GREEN,
        font=("Arial", 13)
    ).pack(pady=10)

    make_button(root, "QUAY LẠI", home_screen).pack(pady=10)


def hint_price():
    count = profile.get("hint_count", 0)
    return HINT_PRICES[count % 10]


# ==========================================
# CHỌN LỚP VÀ ĐỘ KHÓ
# ==========================================

def test_screen():
    clear_screen()

    heading("CHỌN CẤP ĐỘ THI")

    frame = make_card(root)
    frame.pack(pady=10)

    tk.Label(
        frame, text="Chọn lớp",
        bg=CARD, fg=YELLOW,
        font=("Arial", 15, "bold")
    ).pack()

    grade_var = tk.IntVar(value=6)

    for grade in [6, 7, 8, 9]:
        tk.Radiobutton(
            frame,
            text=f"Lớp {grade}",
            variable=grade_var,
            value=grade,
            bg=CARD, fg=WHITE,
            selectcolor=BG,
            activebackground=CARD,
            font=("Arial", 13)
        ).pack(anchor="w")

    tk.Label(
        frame, text="Chọn độ khó",
        bg=CARD, fg=YELLOW,
        font=("Arial", 15, "bold")
    ).pack(pady=(15, 5))

    level_var = tk.StringVar(value="Bình thường")

    for level in ["Dễ", "Bình thường", "Khó", "Rất khó"]:
        tk.Radiobutton(
            frame,
            text=level,
            variable=level_var,
            value=level,
            bg=CARD, fg=WHITE,
            selectcolor=BG,
            activebackground=CARD,
            font=("Arial", 13)
        ).pack(anchor="w")

    make_button(
        root, "BẮT ĐẦU THI",
        lambda: start_quiz(
            grade_var.get(), level_var.get()
        ),
        GREEN
    ).pack(pady=15)

    make_button(root, "QUAY LẠI", home_screen).pack()


# ==========================================
# TẠO CÂU HỎI
# ==========================================

def generate_question(grade, level):

    difficulty = {
        "Dễ": 1,
        "Bình thường": 2,
        "Khó": 3,
        "Rất khó": 4
    }[level]

    operations = ["+", "-", "×", "÷", "^"]

    op = random.choice(operations)

    limit = grade * 5 * difficulty + 10

    if op == "+":
        a = random.randint(1, limit)
        b = random.randint(1, limit)
        return f"{a} + {b}", a + b, f"Cộng hai số: {a} và {b}."

    if op == "-":
        a = random.randint(1, limit)
        b = random.randint(1, limit)
        a, b = max(a, b), min(a, b)
        return f"{a} - {b}", a - b, f"Lấy số lớn trừ số nhỏ: {a} - {b}."

    if op == "×":
        a = random.randint(2, grade * difficulty + 5)
        b = random.randint(2, grade * difficulty + 5)
        return f"{a} × {b}", a * b, f"Nhân {a} với {b}."

    if op == "÷":
        b = random.randint(2, grade * difficulty + 5)
        answer = random.randint(2, grade * difficulty + 5)
        a = b * answer
        return f"{a} ÷ {b}", answer, f"Tìm số nhân với {b} để được {a}."

    if difficulty == 1:
        exponent = 2
    elif difficulty == 2:
        exponent = random.choice([2, 3])
    else:
        exponent = random.choice([2, 3, 4])

    a = random.randint(2, min(8, grade + difficulty))
    return (
        f"{a} ^ {exponent}",
        a ** exponent,
        f"Lũy thừa là phép nhân {a} với chính nó {exponent} lần."
    )


# ==========================================
# BẮT ĐẦU BÀI THI
# ==========================================

def start_quiz(grade, level):

    global questions, question_index
    global correct_count, selected_grade
    global selected_level, remaining_seconds
    global quiz_active, hint_used_for_question

    agree = messagebox.askyesno(
        "CAM KẾT THI",
        "Bạn cam kết làm bài trung thực:\n\n"
        "- Không sử dụng tài liệu.\n"
        "- Không nhờ người khác làm hộ.\n"
        "- Không tìm đáp án bên ngoài.\n\n"
        "Game không thể giám sát toàn bộ máy tính.\n\n"
        "Bạn có đồng ý?"
    )

    if not agree:
        return

    selected_grade = grade
    selected_level = level

    questions = [
        generate_question(grade, level)
        for _ in range(30)
    ]

    question_index = 0
    correct_count = 0
    remaining_seconds = 25 * 60
    quiz_active = True
    hint_used_for_question = False

    show_question()


# ==========================================
# RỜI BÀI THI
# ==========================================

def leave_quiz():
    global quiz_active, timer_job

    if not quiz_active:
        return

    confirm = messagebox.askyesno(
        "Rời bài thi",
        "Bạn có chắc muốn rời bài thi không?\\n"
        "Kết quả bài thi này sẽ không được lưu và bạn sẽ không nhận thưởng."
    )

    if not confirm:
        return

    quiz_active = False

    if timer_job is not None:
        try:
            root.after_cancel(timer_job)
        except:
            pass
        timer_job = None

    home_screen()


# ==========================================
# HIỂN THỊ CÂU HỎI VÀ ĐẾM GIỜ
# ==========================================

def update_timer():
    global remaining_seconds, timer_job

    if not quiz_active:
        return

    if remaining_seconds <= 0:
        finish_quiz()
        return

    minutes = remaining_seconds // 60
    seconds = remaining_seconds % 60

    timer_label.config(
        text=f"⏱ {minutes:02d}:{seconds:02d}"
    )

    remaining_seconds -= 1

    timer_job = root.after(1000, update_timer)


def show_question():
    global hint_used_for_question

    clear_screen()
    hint_used_for_question = False

    heading("MATH MASTER 6", 25)

    global timer_label

    timer_label = tk.Label(
        root,
        text="",
        font=("Arial", 19, "bold"),
        fg=YELLOW,
        bg=BG
    )
    timer_label.pack()

    tk.Label(
        root,
        text=f"Lớp {selected_grade} | {selected_level}",
        bg=BG, fg=GREEN,
        font=("Arial", 13)
    ).pack(pady=5)

    tk.Label(
        root,
        text=f"CÂU {question_index + 1}/30",
        bg=BG, fg=WHITE,
        font=("Arial", 19, "bold")
    ).pack(pady=20)

    expression, answer, explanation = questions[question_index]

    tk.Label(
        root,
        text=expression + " = ?",
        bg=BG, fg=YELLOW,
        font=("Arial", 38, "bold")
    ).pack(pady=25)

    answer_entry = tk.Entry(
        root,
        font=("Arial", 23),
        justify="center",
        width=15
    )
    answer_entry.pack(pady=10)
    answer_entry.focus_set()

    hint_label = tk.Label(
        root,
        text="Gợi ý chưa được mua",
        bg=BG, fg="#94A3B8",
        font=("Arial", 12)
    )
    hint_label.pack(pady=10)

    def buy_hint():
        global hint_used_for_question

        if hint_used_for_question:
            messagebox.showinfo(
                "Thông báo",
                "Bạn đã mua gợi ý cho câu này rồi!"
            )
            return

        if profile.get("hint_date") != date.today().isoformat():
            profile["hint_date"] = date.today().isoformat()
            profile["hint_count"] = 0

        count = profile["hint_count"]

        if count >= 10:
            messagebox.showinfo(
                "Thông báo",
                "Bạn đã sử dụng đủ 10 lần mua hôm nay!"
            )
            return

        price = hint_price()

        if profile["money"] < price:
            messagebox.showwarning(
                "Không đủ tiền",
                f"Gợi ý này giá {price:,} tiền."
            )
            return

        if not messagebox.askyesno(
            "Mua gợi ý",
            f"Mua gợi ý với giá {price:,} tiền?"
        ):
            return

        profile["money"] -= price
        profile["hint_count"] += 1
        hint_used_for_question = True

        hint_label.config(
            text=f"GỢI Ý: {explanation}\nĐÁP ÁN: {answer}",
            fg=GREEN
        )

        save_data()

    def submit():
        global question_index, correct_count

        raw = answer_entry.get().strip()

        if not raw:
            messagebox.showwarning(
                "Thông báo", "Bạn chưa nhập đáp án!"
            )
            return

        try:
            value = int(raw)
        except ValueError:
            messagebox.showwarning(
                "Thông báo",
                "Chỉ nhập số nguyên!"
            )
            return

        if value == answer:
            correct_count += 1

        question_index += 1

        if question_index >= 30:
            finish_quiz()
        else:
            show_question()

    make_button(
        root, "💡 MUA GỢI Ý",
        buy_hint, "#D97706"
    ).pack(pady=8)

    make_button(
        root, "NỘP ĐÁP ÁN",
        submit, GREEN
    ).pack(pady=8)

    make_button(
        root, "🚪 RỜI BÀI THI",
        leave_quiz, RED
    ).pack(pady=8)

    answer_entry.bind(
        "<Return>", lambda event: submit()
    )

    update_timer()


# ==========================================
# KẾT THÚC BÀI THI
# ==========================================

def finish_quiz():
    global quiz_active, timer_job

    if not quiz_active:
        return

    quiz_active = False

    if timer_job:
        try:
            root.after_cancel(timer_job)
        except:
            pass

    percentage = correct_count / 30 * 100

    if percentage >= 90:
        rank = "XUẤT SẮC"
        money, diamonds, xp = 100, 3, 100
        color = GREEN

    elif percentage >= 60:
        rank = "GIỎI"
        money, diamonds, xp = 75, 2, 80
        color = BLUE

    elif percentage >= 40:
        rank = "ĐẠT"
        money, diamonds, xp = 50, 1, 45
        color = YELLOW

    else:
        rank = "CẦN CỐ GẮNG HƠN"
        money, diamonds, xp = 10, 0, 0
        color = RED

    profile["money"] += money
    profile["diamonds"] += diamonds
    profile["xp"] += xp

    profile["total_games"] += 1
    profile["total_correct"] += correct_count

    score_out_of_10 = round(correct_count / 3, 1)
    history_item = {
        "date": datetime.now().strftime("%d/%m/%Y %H:%M"),
        "grade": selected_grade,
        "difficulty": selected_level,
        "correct": correct_count,
        "total": 30,
        "score": score_out_of_10,
        "percentage": round(percentage, 1),
        "rank": rank
    }
    profile.setdefault("history", []).append(history_item)

    old_level = profile["level"]
    refresh_profile()

    save_data()

    clear_screen()

    heading("🏆 KẾT QUẢ BÀI THI", 29)

    frame = make_card(root)
    frame.pack(pady=15)

    tk.Label(
        frame,
        text=f"{correct_count}/30 câu đúng",
        bg=CARD, fg=GREEN,
        font=("Arial", 25, "bold")
    ).pack(pady=10)

    tk.Label(
        frame,
        text=f"Điểm: {score_out_of_10:.1f}/10  ({percentage:.1f}%)",
        bg=CARD, fg=WHITE,
        font=("Arial", 20, "bold")
    ).pack(pady=10)

    tk.Label(
        frame,
        text=rank,
        bg=CARD, fg=color,
        font=("Arial", 23, "bold")
    ).pack(pady=10)

    tk.Label(
        frame,
        text=f"🪙 +{money} tiền",
        bg=CARD, fg=YELLOW,
        font=("Arial", 14)
    ).pack(pady=5)

    tk.Label(
        frame,
        text=f"💎 +{diamonds} kim cương",
        bg=CARD, fg=BLUE,
        font=("Arial", 14)
    ).pack(pady=5)

    tk.Label(
        frame,
        text=f"⭐ +{xp} XP",
        bg=CARD, fg=GREEN,
        font=("Arial", 14)
    ).pack(pady=5)

    if profile["level"] > old_level:
        tk.Label(
            frame,
            text=f"🎉 LÊN CẤP {profile['level']}!",
            bg=CARD, fg=YELLOW,
            font=("Arial", 17, "bold")
        ).pack(pady=10)

    make_button(
        root, "🏠 TRANG CHỦ",
        home_screen
    ).pack(pady=10)

    make_button(
        root, "🔄 THI LẠI",
        test_screen, GREEN
    ).pack()


# ==========================================
# LỊCH SỬ LÀM BÀI
# ==========================================

def history_screen():
    clear_screen()

    heading("📜 LỊCH SỬ LÀM BÀI")

    history = list(reversed(profile.get("history", [])))

    if not history:
        tk.Label(
            root,
            text="Bạn chưa hoàn thành bài thi nào.",
            bg=BG, fg=WHITE,
            font=("Arial", 15)
        ).pack(pady=30)
    else:
        summary = tk.Label(
            root,
            text=f"Tổng số bài đã làm: {len(history)}",
            bg=BG, fg=YELLOW,
            font=("Arial", 14, "bold")
        )
        summary.pack(pady=5)

        container = tk.Frame(root, bg=BG)
        container.pack(fill="both", expand=True, padx=35, pady=10)

        scrollbar = tk.Scrollbar(container)
        scrollbar.pack(side="right", fill="y")

        history_list = tk.Listbox(
            container,
            font=("Arial", 12),
            bg=CARD, fg=WHITE,
            selectbackground=BLUE,
            yscrollcommand=scrollbar.set,
            height=18
        )
        history_list.pack(side="left", fill="both", expand=True)
        scrollbar.config(command=history_list.yview)

        for index, item in enumerate(history, start=1):
            history_list.insert(
                "end",
                f"{index}. {item.get('date', 'Không rõ ngày')} | "
                f"Lớp {item.get('grade', '?')} - {item.get('difficulty', '?')} | "
                f"{item.get('correct', 0)}/{item.get('total', 30)} câu đúng | "
                f"Điểm: {item.get('score', 0)}/10 | "
                f"{item.get('rank', '')}"
            )

    make_button(root, "QUAY LẠI", home_screen).pack(pady=12)


# ==========================================
# THỐNG KÊ
# ==========================================

def statistics_screen():
    clear_screen()

    heading("📊 THỐNG KÊ TÀI KHOẢN")

    frame = make_card(root)
    frame.pack(pady=20)

    data = [
        ("Tài khoản", current_user),
        ("Cấp độ", profile["level"]),
        ("Kinh nghiệm", profile["xp"]),
        ("Tiền", f"{profile['money']:,}"),
        ("Kim cương", profile["diamonds"]),
        ("Số bài đã làm", profile["total_games"]),
        ("Tổng câu đúng", profile["total_correct"]),
        ("Chuỗi ngày", profile["streak"])
    ]

    for name, value in data:
        tk.Label(
            frame,
            text=f"{name}: {value}",
            bg=CARD, fg=WHITE,
            font=("Arial", 14)
        ).pack(anchor="w", pady=7)

    make_button(root, "QUAY LẠI", home_screen).pack(pady=15)


# ==========================================
# ĐĂNG XUẤT
# ==========================================

def logout():
    global current_user, profile

    save_data()
    current_user = None
    profile = None

    login_screen()


# ==========================================
# KHỞI ĐỘNG
# ==========================================

load_data()
login_screen()
root.mainloop()
