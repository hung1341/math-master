import type { KnowledgeCategory } from './grade4Knowledge';

export const GRADE_3_KNOWLEDGE: KnowledgeCategory[] = [
  {
    id: 'numbers',
    label: 'Số, La Mã & Tìm x',
    sections: [
      {
        id: 'g3-numbers',
        title: '1. Các số đến 10 000 và 100 000',
        bullets: [
          'Số có 4 chữ số gồm các hàng: Nghìn, trăm, chục, đơn vị. Số có 5 chữ số thêm hàng chục nghìn.',
          'So sánh hai số: Số nào có nhiều chữ số hơn thì lớn hơn; nếu bằng số chữ số thì so sánh từng cặp chữ số từ trái sang phải.',
          'Số liền trước kém số đã cho 1 đơn vị; số liền sau hơn số đã cho 1 đơn vị.',
          'Làm tròn số đến hàng chục (xem hàng đơn vị ≥ 5 thì làm tròn lên), hàng trăm (xem hàng chục), hàng nghìn (xem hàng trăm).',
        ],
        example: {
          title: 'Ví dụ làm tròn số',
          lines: [
            'Làm tròn 3 482 đến hàng trăm → 3 500 (vì hàng chục là 8 ≥ 5).',
            'Làm tròn 6 230 đến hàng nghìn → 6 000 (vì hàng trăm là 2 < 5).',
          ],
        },
      },
      {
        id: 'g3-roman',
        title: '2. Chữ số La Mã (I → XX)',
        formulas: [
          { label: 'Các ký hiệu gốc', formula: 'I = 1   ·   V = 5   ·   X = 10' },
        ],
        bullets: [
          'Các số từ 1 đến 10: I (1), II (2), III (3), IV (4), V (5), VI (6), VII (7), VIII (8), IX (9), X (10).',
          'Các số từ 11 đến 20: XI (11), XII (12), XIII (13), XIV (14), XV (15), XVI (16), XVII (17), XVIII (18), XIX (19), XX (20).',
          'Quy tắc ghép: Viết I bên trái V hoặc X để bớt 1 (IV = 4, IX = 9); viết bên phải để thêm vào (VI = 6, XI = 11).',
        ],
      },
      {
        id: 'g3-find-x',
        title: '3. Tìm thành phần chưa biết (Tìm x)',
        formulas: [
          { label: 'Tìm số hạng', formula: 'Số hạng = Tổng - Số hạng đã biết' },
          { label: 'Tìm số bị trừ / số trừ', formula: 'SBT = Hiệu + ST   |   ST = SBT - Hiệu' },
          { label: 'Tìm thừa số', formula: 'Thừa số = Tích : Thừa số đã biết' },
          { label: 'Tìm số bị chia / số chia', formula: 'SBC = Thương × SC   |   SC = SBC : Thương' },
        ],
        bullets: [
          'Nếu là phép chia có dư: Số bị chia = Thương × Số chia + Số dư.',
          'Thứ tự tính biểu thức: Trong ngoặc trước → Nhân, chia trước → Cộng, trừ sau (từ trái sang phải).',
        ],
      },
    ],
  },
  {
    id: 'operations',
    label: 'Gấp/Giảm & Chia có dư',
    sections: [
      {
        id: 'g3-scale',
        title: '1. Gấp lên – Giảm đi nhiều lần & So sánh',
        formulas: [
          { label: 'Gấp a lên n lần', formula: 'a × n' },
          { label: 'Giảm a đi n lần', formula: 'a : n' },
          { label: 'Số lớn gấp mấy lần số bé', formula: 'Số lớn : Số bé' },
        ],
        bullets: [
          'Phân biệt: "Thêm n đơn vị" là phép cộng (+), còn "Gấp lên n lần" là phép nhân (×).',
          'Phân biệt: "Bớt đi n đơn vị" là phép trừ (-), còn "Giảm đi n lần" là phép chia (:).',
        ],
        example: {
          title: 'Ví dụ minh họa',
          lines: [
            'Gấp 12 lên 4 lần được 12 × 4 = 48.',
            'Số lớn 54 gấp số bé 9 số lần là: 54 : 9 = 6 (lần).',
          ],
        },
      },
      {
        id: 'g3-remainder',
        title: '2. Phép chia hết và Phép chia có dư',
        bullets: [
          'Phép chia hết có số dư bằng 0.',
          'Trong phép chia có dư, số dư luôn BÉ HƠN số chia.',
          'Số dư lớn nhất có thể bằng (Số chia - 1). Ví dụ chia cho 7 thì số dư lớn nhất là 6.',
        ],
        example: {
          title: 'Ví dụ tìm số bị chia',
          lines: [
            'Số chia là 6, thương là 14, số dư là 5 → Số bị chia = 14 × 6 + 5 = 89.',
          ],
        },
      },
      {
        id: 'g3-unit-method',
        title: '3. Bài toán rút về đơn vị (Giải bằng 2 bước)',
        bullets: [
          'Bước 1 (Rút về 1 phần): Lấy tổng số lượng chia cho số nhóm để tìm giá trị của 1 phần.',
          'Bước 2: Lấy giá trị 1 phần nhân với số nhóm cần tìm.',
        ],
        example: {
          title: '5 hộp có 60 viên kẹo. Hỏi 8 hộp có bao nhiêu viên?',
          lines: [
            '1 hộp có: 60 : 5 = 12 (viên).',
            '8 hộp có: 12 × 8 = 96 (viên).',
          ],
        },
      },
    ],
  },
  {
    id: 'sequences_units',
    label: 'Đơn vị đo & Thời gian',
    sections: [
      {
        id: 'g3-length',
        title: '1. Đơn vị đo độ dài (km, m, dm, cm, mm)',
        formulas: [
          { label: 'Quy đổi chuẩn', formula: '1 km = 1 000 m   |   1 m = 10 dm = 100 cm = 1 000 mm' },
        ],
        bullets: [
          '1 dm = 10 cm = 100 mm; 1 cm = 10 mm.',
          'Hai đơn vị đo độ dài liền nhau (từ m đến mm) hơn kém nhau 10 lần.',
        ],
        example: {
          title: 'Ví dụ đổi đơn vị',
          lines: [
            '3 m 45 cm = 300 cm + 45 cm = 345 cm.',
            '2 km 350 m = 2 000 m + 350 m = 2 350 m.',
          ],
        },
      },
      {
        id: 'g3-mass-cap',
        title: '2. Khối lượng (kg, g) & Dung tích (lít, ml)',
        formulas: [
          { label: 'Khối lượng & Dung tích', formula: '1 kg = 1 000 g   |   1 lít = 1 000 ml' },
        ],
        bullets: [
          'Gam (g) dùng đo vật nhẹ; Ki-lô-gam (kg) dùng đo vật nặng hơn.',
          'Mi-li-lít (ml) và Lít (l) dùng đo lượng chất lỏng (nước, sữa...).',
        ],
        example: {
          title: 'Ví dụ',
          lines: [
            '4 lít 250 ml = 4 250 ml.',
            '2 kg 80 g = 2 080 g.',
          ],
        },
      },
      {
        id: 'g3-time',
        title: '3. Xem đồng hồ, Ngày – Giờ – Tháng – Năm',
        bullets: [
          '1 ngày = 24 giờ; 1 giờ = 60 phút; 1 năm thường = 365 ngày (năm nhuận 366 ngày).',
          'Các tháng có 31 ngày: 1, 3, 5, 7, 8, 10, 12.',
          'Các tháng có 30 ngày: 4, 6, 9, 11. Tháng 2 có 28 ngày (năm nhuận 29 ngày).',
        ],
      },
    ],
  },
  {
    id: 'fractions_word',
    label: 'Hình học (Chu vi & Diện tích)',
    sections: [
      {
        id: 'g3-midpoint-circle',
        title: '1. Trung điểm đoạn thẳng & Hình tròn',
        formulas: [
          { label: 'Trung điểm M của AB', formula: 'AM = MB = AB : 2' },
          { label: 'Hình tròn', formula: 'Đường kính = Bán kính × 2' },
        ],
        bullets: [
          'M là trung điểm của đoạn thẳng AB khi M nằm giữa A, B và AM = MB.',
          'Hình vuông có 4 góc vuông và 4 cạnh bằng nhau; hình chữ nhật có 4 góc vuông, 2 cạnh dài bằng nhau và 2 cạnh ngắn bằng nhau.',
        ],
      },
      {
        id: 'g3-rect',
        title: '2. Chu vi và Diện tích Hình chữ nhật',
        formulas: [
          { label: 'Chu vi HCN', formula: 'P = (Chiều dài + Chiều rộng) × 2' },
          { label: 'Diện tích HCN', formula: 'S = Chiều dài × Chiều rộng' },
        ],
        bullets: [
          'Chiều dài và chiều rộng phải cùng một đơn vị đo trước khi tính.',
          'Nửa chu vi hình chữ nhật = Chu vi : 2 = Chiều dài + Chiều rộng.',
        ],
        example: {
          title: 'HCN dài 12 cm, rộng 5 cm',
          lines: [
            'Chu vi = (12 + 5) × 2 = 34 (cm).',
            'Diện tích = 12 × 5 = 60 (cm²).',
          ],
        },
      },
      {
        id: 'g3-square',
        title: '3. Chu vi và Diện tích Hình vuông',
        formulas: [
          { label: 'Chu vi hình vuông', formula: 'P = Cạnh × 4   →   Cạnh = P : 4' },
          { label: 'Diện tích hình vuông', formula: 'S = Cạnh × Cạnh' },
        ],
        bullets: [
          'Nếu biết chu vi hình vuông, chia cho 4 để tìm độ dài 1 cạnh, rồi lấy Cạnh × Cạnh để tính diện tích.',
        ],
        example: {
          title: 'Hình vuông có chu vi 36 cm',
          lines: [
            'Cạnh hình vuông = 36 : 4 = 9 (cm).',
            'Diện tích = 9 × 9 = 81 (cm²).',
          ],
        },
      },
    ],
  },
];
