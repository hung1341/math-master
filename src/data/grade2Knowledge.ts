import type { KnowledgeCategory } from './grade4Knowledge';

export const GRADE_2_KNOWLEDGE: KnowledgeCategory[] = [
  {
    id: 'numbers',
    label: 'Số & Thành phần',
    sections: [
      {
        id: 'g2-numbers',
        title: '1. Các số đến 100 và 1 000',
        bullets: [
          'Số có 2 chữ số gồm hàng chục và hàng đơn vị. Số bé nhất có 2 chữ số là 10; số lớn nhất có 2 chữ số là 99.',
          'Số có 3 chữ số gồm hàng trăm, hàng chục và hàng đơn vị. Số bé nhất có 3 chữ số là 100; số lớn nhất có 3 chữ số là 999.',
          'Phân tích số thành tổng các trăm, chục, đơn vị: ví dụ 345 = 300 + 40 + 5.',
          'Số liền trước kém số đã cho 1 đơn vị (lấy số đó trừ 1); số liền sau hơn số đã cho 1 đơn vị (lấy số đó cộng 1).',
        ],
        example: {
          title: 'Ví dụ số liền trước, liền sau',
          lines: [
            'Số liền trước của 400 là 400 - 1 = 399.',
            'Số liền sau của 299 là 299 + 1 = 300.',
          ],
        },
      },
      {
        id: 'g2-terms',
        title: '2. Tên gọi thành phần các phép tính',
        formulas: [
          { label: 'Phép cộng', formula: 'Số hạng + Số hạng = Tổng' },
          { label: 'Phép trừ', formula: 'Số bị trừ - Số trừ = Hiệu' },
          { label: 'Phép nhân', formula: 'Thừa số × Thừa số = Tích' },
          { label: 'Phép chia', formula: 'Số bị chia : Số chia = Thương' },
        ],
        bullets: [
          'Ghi nhớ tên gọi để làm đúng các bài toán tìm Tổng, Hiệu, Tích hoặc Thương khi đề bài cho sẵn các thành phần.',
        ],
      },
    ],
  },
  {
    id: 'operations',
    label: 'Bảng tính & Toán đố',
    sections: [
      {
        id: 'g2-add-sub',
        title: '1. Cộng, trừ có nhớ (qua 10, phạm vi 100 & 1 000)',
        bullets: [
          'Cộng qua 10: Tách số để làm tròn chục trước rồi cộng phần còn lại (ví dụ: 9 + 5 = 9 + 1 + 4 = 14).',
          'Đặt tính theo cột dọc: Viết hàng đơn vị thẳng hàng đơn vị, hàng chục thẳng hàng chục, hàng trăm thẳng hàng trăm; tính từ phải sang trái.',
          'Khi tổng ở một hàng ≥ 10 thì nhớ 1 sang hàng liền trước bên trái.',
        ],
      },
      {
        id: 'g2-mul-div',
        title: '2. Bảng nhân, bảng chia 2, 3, 4, 5',
        bullets: [
          'Phép nhân là tổng các số hạng bằng nhau (ví dụ: 4 + 4 + 4 = 4 × 3 = 12).',
          'Từ một phép nhân viết được hai phép chia tương ứng: 4 × 5 = 20 → 20 : 4 = 5 và 20 : 5 = 4.',
        ],
        example: {
          title: 'Ví dụ toán đố nhân chia',
          lines: [
            'Mỗi đĩa có 5 quả cam. 6 đĩa có: 5 × 6 = 30 (quả).',
            'Chia đều 24 cái bánh vào 4 hộp, mỗi hộp có: 24 : 4 = 6 (cái).',
          ],
        },
      },
      {
        id: 'g2-more-less',
        title: '3. Bài toán về nhiều hơn, ít hơn',
        formulas: [
          { label: 'Bài toán nhiều hơn', formula: 'Số lớn = Số bé + Phần nhiều hơn' },
          { label: 'Bài toán ít hơn', formula: 'Số bé = Số lớn - Phần ít hơn' },
        ],
        bullets: [
          'Đọc kỹ đề xem đối tượng cần tìm thuộc nhóm "nhiều hơn" hay "ít hơn" so với đối tượng đã biết.',
          'Nhiều hơn thì làm phép cộng; ít hơn thì làm phép trừ.',
        ],
        example: {
          title: 'Ví dụ minh họa',
          lines: [
            'An có 18 viên bi, Bình có nhiều hơn An 7 viên. Bình có: 18 + 7 = 25 (viên).',
            'Lan có 24 nhãn vở, Mai có ít hơn Lan 6 nhãn. Mai có: 24 - 6 = 18 (nhãn).',
          ],
        },
      },
    ],
  },
  {
    id: 'sequences_units',
    label: 'Đo lường & Thời gian',
    sections: [
      {
        id: 'g2-length',
        title: '1. Đơn vị đo độ dài (km, m, dm, cm)',
        formulas: [
          { label: 'Đổi đơn vị chuẩn', formula: '1 dm = 10 cm   |   1 m = 10 dm = 100 cm   |   1 km = 1 000 m' },
        ],
        bullets: [
          'dm (đề-xi-mét) lớn hơn cm (xăng-ti-mét) 10 lần.',
          'Khi thực hiện phép tính có đơn vị đo, cần đổi về cùng một đơn vị rồi mới cộng hoặc trừ.',
        ],
        example: {
          title: 'Ví dụ',
          lines: [
            '3 dm 5 cm = 30 cm + 5 cm = 35 cm.',
            '2 m 6 dm = 20 dm + 6 dm = 26 dm.',
          ],
        },
      },
      {
        id: 'g2-kg-l',
        title: '2. Ki-lô-gam (kg) & Lít (l)',
        bullets: [
          'Ki-lô-gam (kg) dùng để đo khối lượng (cân nặng) của vật.',
          'Lít (l) dùng để đo sức chứa hoặc lượng chất lỏng (nước, sữa, dầu ăn...).',
        ],
      },
      {
        id: 'g2-time',
        title: '3. Ngày – Giờ – Tuần – Tháng',
        formulas: [
          { label: 'Thời gian cơ bản', formula: '1 ngày = 24 giờ   |   1 giờ = 60 phút   |   1 tuần = 7 ngày' },
        ],
        bullets: [
          'Đọc giờ trên đồng hồ: Kim ngắn chỉ giờ, kim dài chỉ 12 là giờ đúng, chỉ số 3 là hơn 15 phút, chỉ số 6 là rưỡi (30 phút).',
          'Một ngày có 24 giờ, tính từ 12 giờ đêm hôm trước đến 12 giờ đêm hôm sau (chia thành sáng, trưa, chiều, tối, đêm).',
        ],
      },
    ],
  },
  {
    id: 'fractions_word',
    label: 'Đường gấp khúc & Hình',
    sections: [
      {
        id: 'g2-polyline',
        title: '1. Độ dài đường gấp khúc',
        formulas: [
          {
            label: 'Công thức tính',
            formula: 'Độ dài đường gấp khúc = Tổng độ dài các đoạn thẳng của nó',
          },
        ],
        bullets: [
          'Đường gấp khúc gồm nhiều đoạn thẳng nối tiếp nhau (không thẳng hàng).',
          'Muốn tính độ dài đường gấp khúc, ta cộng độ dài tất cả các đoạn thẳng lại (cùng đơn vị đo).',
        ],
        example: {
          title: 'Đường gấp khúc ABCD gồm AB = 12 cm, BC = 15 cm, CD = 18 cm',
          lines: ['Độ dài đường gấp khúc ABCD = 12 + 15 + 18 = 45 (cm).'],
        },
      },
      {
        id: 'g2-shapes',
        title: '2. Ba điểm thẳng hàng, Hình tứ giác & Hình khối',
        bullets: [
          'Ba điểm thẳng hàng là ba điểm cùng nằm trên một đường thẳng.',
          'Hình tứ giác có 4 cạnh và 4 đỉnh (ví dụ: hình vuông, hình chữ nhật...).',
          'Các hình khối đã học: Khối trụ, khối cầu, khối lập phương, khối hộp chữ nhật.',
        ],
      },
    ],
  },
];
