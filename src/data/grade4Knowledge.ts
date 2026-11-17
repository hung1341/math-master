export interface KnowledgeFormula {
  label?: string;
  formula: string;
}

export interface KnowledgeSection {
  id: string;
  title: string;
  bullets: string[];
  formulas?: KnowledgeFormula[];
  example?: {
    title: string;
    lines: string[];
  };
}

export interface KnowledgeCategory {
  id: 'numbers' | 'operations' | 'sequences_units' | 'fractions_word';
  label: string;
  sections: KnowledgeSection[];
}

export const GRADE_4_KNOWLEDGE: KnowledgeCategory[] = [
  {
    id: 'numbers',
    label: 'Số & Biểu thức',
    sections: [
      {
        id: 'digits',
        title: '1. Số và chữ số',
        bullets: [
          'Dùng 10 chữ số để viết mọi số tự nhiên: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9.',
          'Có 10 số có 1 chữ số (0 → 9); 90 số có 2 chữ số (10 → 99); 900 số có 3 chữ số (100 → 999); 9000 số có 4 chữ số (1000 → 9999).',
          'Số tự nhiên nhỏ nhất là 0. Không có số tự nhiên lớn nhất.',
          'Hai số tự nhiên liên tiếp hơn (kém) nhau 1 đơn vị.',
          'Số chẵn có tận cùng là 0, 2, 4, 6, 8; số lẻ có tận cùng là 1, 3, 5, 7, 9. Hai số chẵn (hoặc lẻ) liên tiếp hơn kém nhau 2 đơn vị.',
        ],
      },
      {
        id: 'places',
        title: '2. Hàng và lớp (Đơn vị · Nghìn · Triệu)',
        bullets: [
          'Lớp đơn vị gồm 3 hàng: Hàng đơn vị, hàng chục, hàng trăm.',
          'Lớp nghìn gồm 3 hàng: Hàng nghìn, hàng chục nghìn, hàng trăm nghìn.',
          'Lớp triệu gồm 3 hàng: Hàng triệu, hàng chục triệu, hàng trăm triệu.',
        ],
        example: {
          title: 'Phân tích số 123 456 789',
          lines: [
            'Lớp triệu: 1 trăm triệu, 2 chục triệu, 3 triệu.',
            'Lớp nghìn: 4 trăm nghìn, 5 chục nghìn, 6 nghìn.',
            'Lớp đơn vị: 7 trăm, 8 chục, 9 đơn vị.',
          ],
        },
      },
      {
        id: 'algebraic-expr',
        title: '3. Biểu thức có chứa chữ (1, 2, 3 chữ)',
        bullets: [
          'Biểu thức chứa 1 chữ (vd: 3 + a): Mỗi lần thay chữ bằng số ta tính được một giá trị của biểu thức.',
          'Biểu thức chứa 2 chữ (vd: a + b): Thay đồng thời hai chữ bằng số để tính giá trị.',
          'Biểu thức chứa 3 chữ (vd: a + b + c): Thay cả ba chữ bằng số rồi thực hiện phép tính.',
        ],
        example: {
          title: 'Ví dụ minh họa',
          lines: [
            'Nếu a = 2 thì 3 + a = 3 + 2 = 5.',
            'Nếu a = 3, b = 2 thì a + b = 3 + 2 = 5.',
            'Nếu a = 2, b = 3, c = 4 thì a + b + c = 2 + 3 + 4 = 9.',
          ],
        },
      },
      {
        id: 'order-ops',
        title: '4. Thứ tự tính giá trị biểu thức',
        bullets: [
          'Không có ngoặc, chỉ có + và - (hoặc chỉ có × và ÷): Tính từ trái sang phải.',
          'Không có ngoặc, có đủ +, -, ×, ÷: Thực hiện nhân, chia trước rồi đến cộng, trừ sau.',
          'Có dấu ngoặc đơn ( ): Thực hiện trong ngoặc trước, ngoài ngoặc sau.',
        ],
        example: {
          title: 'Ví dụ chuẩn',
          lines: [
            '542 + 123 - 79 = 665 - 79 = 586',
            '27 : 3 - 4 × 2 = 9 - 8 = 1',
            '25 × (21 + 120) = 25 × 141 = 3525',
          ],
        },
      },
    ],
  },
  {
    id: 'operations',
    label: 'Phép tính & Chia hết',
    sections: [
      {
        id: 'addition',
        title: 'A. Phép cộng & Tính chất chẵn lẻ',
        bullets: [
          'Giao hoán: a + b = b + a. Kết hợp: (a + b) + c = a + (b + c). Cộng với 0: a + 0 = 0 + a = a.',
          'Tổng có số lượng số hạng lẻ là số lẻ → tổng lẻ; số lượng số hạng lẻ là số chẵn → tổng chẵn.',
          'Tổng các số chẵn luôn là số chẵn. Tổng một số lẻ và một số chẵn là số lẻ.',
          'Tổng hai số tự nhiên liên tiếp luôn là một số lẻ.',
        ],
      },
      {
        id: 'subtraction',
        title: 'B. Phép trừ',
        formulas: [
          { formula: 'a - (b + c) = (a - b) - c = (a - c) - b' },
        ],
        bullets: [
          'Số bị trừ và số trừ cùng tăng (hoặc cùng giảm) n đơn vị thì hiệu không đổi.',
          'Số bị trừ tăng n đơn vị (số trừ giữ nguyên) → hiệu tăng n đơn vị; số trừ tăng n đơn vị (số bị trừ giữ nguyên) → hiệu giảm n đơn vị.',
          'Số bị trừ gấp lên n lần (giữ nguyên số trừ) → hiệu tăng thêm (n - 1) lần số bị trừ.',
          'Số trừ gấp lên n lần (giữ nguyên số bị trừ) → hiệu giảm đi (n - 1) lần số trừ.',
        ],
      },
      {
        id: 'multiplication',
        title: 'C. Phép nhân',
        formulas: [
          { label: 'Phân phối với cộng', formula: 'a × (b + c) = a × b + a × c' },
          { label: 'Phân phối với trừ', formula: 'a × (b - c) = a × b - a × c' },
        ],
        bullets: [
          'Giao hoán: a × b = b × a. Kết hợp: a × (b × c) = (a × b) × c.',
          'Nhân với 0 bằng 0 (a × 0 = 0); nhân với 1 bằng chính nó (a × 1 = a).',
          'Một thừa số gấp n lần và thừa số kia giảm n lần → tích không đổi.',
          'Thừa số tăng thêm a đơn vị → tích tăng thêm a lần tích các thừa số còn lại.',
          'Tích có ít nhất 1 thừa số chẵn → tích chẵn. Có số tận cùng 5 và số chẵn (hoặc số tròn chục) → tích tận cùng là 0. Toàn số lẻ và có số tận cùng 5 → tích tận cùng là 5.',
        ],
      },
      {
        id: 'division',
        title: 'D. Phép chia & Dấu hiệu chia hết',
        formulas: [
          { formula: 'a : (b × c) = a : b : c (b, c > 0)' },
          { formula: '(a + b) : c = a : c + b : c  |  (a - b) : c = a : c - b : c' },
        ],
        bullets: [
          'Số bị chia và số chia cùng gấp hoặc giảm n lần (n > 0) → thương không đổi (trong phép chia có dư, số dư cũng gấp/giảm n lần).',
          'Chia hết cho 2: Tận cùng là 0, 2, 4, 6, 8 (số chẵn).',
          'Chia hết cho 5: Tận cùng là 0 hoặc 5.',
          'Chia hết cho 3: Tổng các chữ số chia hết cho 3.',
          'Chia hết cho 9: Tổng các chữ số chia hết cho 9 (mọi số chia hết cho 9 đều chia hết cho 3).',
        ],
      },
    ],
  },
  {
    id: 'sequences_units',
    label: 'Dãy số & Đơn vị đo',
    sections: [
      {
        id: 'sequences',
        title: '1. Dãy số & Dãy số cách đều',
        formulas: [
          {
            label: 'Số số hạng',
            formula: 'Số số hạng = (Số cuối - Số đầu) : Khoảng cách + 1',
          },
          {
            label: 'Tổng dãy cách đều',
            formula: 'Tổng = (Số đầu + Số cuối) × Số số hạng : 2',
          },
        ],
        bullets: [
          'Dãy liên tiếp bắt đầu chẵn – kết thúc lẻ (hoặc ngược lại): số lượng số chẵn bằng số lượng số lẻ.',
          'Bắt đầu chẵn – kết thúc chẵn: số chẵn nhiều hơn số lẻ 1 số (và ngược lại với lẻ – lẻ).',
          'Quy luật thường gặp: cộng/trừ một số không đổi, nhân/chia một số không đổi, hoặc dãy Fibonaci (số sau = tổng 2 số liền trước).',
        ],
        example: {
          title: 'Ví dụ: 1, 4, 7, 10, ..., 100',
          lines: [
            'Số số hạng: (100 - 1) : 3 + 1 = 34 (số hạng).',
            'Tổng dãy số: (100 + 1) × 34 : 2 = 1717.',
          ],
        },
      },
      {
        id: 'mass-units',
        title: '2. Bảng đơn vị đo khối lượng',
        formulas: [
          {
            label: 'Thứ tự lớn → bé',
            formula: 'tấn → tạ → yến → kg → hg → dag → g',
          },
        ],
        bullets: [
          'Mỗi đơn vị đo khối lượng đều gấp 10 lần đơn vị bé hơn liền kề.',
          '1 tấn = 10 tạ = 100 yến = 1 000 kg = 1 000 000 g.',
          '1 tạ = 10 yến = 100 kg; 1 yến = 10 kg; 1 kg = 10 hg = 100 dag = 1 000 g.',
        ],
        example: {
          title: 'Đổi đơn vị mẫu',
          lines: ['1 kg 30 g = 1 000 g + 30 g = 1 030 g.'],
        },
      },
      {
        id: 'time-units',
        title: '3. Giây và Thế kỉ',
        bullets: [
          '1 giờ = 60 phút; 1 phút = 60 giây; 1 giờ = 3 600 giây; 1 ngày = 24 giờ.',
          '1 thế kỉ = 100 năm. Từ năm 1 → 100 là thế kỉ I; 101 → 200 là thế kỉ II.',
          'Từ năm 1901 → 2000 là thế kỉ XX (20); từ 2001 → 2100 là thế kỉ XXI (21).',
        ],
        example: {
          title: 'Ví dụ',
          lines: [
            '4 phút 20 giây = 240 giây + 20 giây = 260 giây.',
            '1/3 ngày = 24 : 3 = 8 giờ.',
          ],
        },
      },
    ],
  },
  {
    id: 'fractions_word',
    label: 'Phân số & Toán điển hình',
    sections: [
      {
        id: 'average',
        title: '1. Tìm số trung bình cộng',
        formulas: [
          {
            label: 'Tổng quát',
            formula: 'Trung bình cộng = Tổng các số : Số các số hạng',
          },
          {
            label: 'Dãy cách đều',
            formula: 'Trung bình cộng = (Số đầu + Số cuối) : 2',
          },
        ],
        bullets: [
          'Muốn tìm tổng các số khi biết trung bình cộng: lấy Trung bình cộng × Số các số hạng.',
        ],
        example: {
          title: 'Ví dụ',
          lines: ['Trung bình cộng của 46, 72 và 59 là (46 + 72 + 59) : 3 = 59.'],
        },
      },
      {
        id: 'sum-diff',
        title: '2. Tìm hai số khi biết Tổng và Hiệu',
        formulas: [
          { label: 'Số bé', formula: 'Số bé = (Tổng - Hiệu) : 2' },
          { label: 'Số lớn', formula: 'Số lớn = (Tổng + Hiệu) : 2' },
        ],
        bullets: [
          'Cách 1: Tìm số bé trước, rồi lấy Số bé + Hiệu (hoặc Tổng - Số bé) để ra số lớn.',
          'Cách 2: Tìm số lớn trước, rồi lấy Số lớn - Hiệu (hoặc Tổng - Số lớn) để ra số bé.',
        ],
        example: {
          title: 'Tổng = 70, Hiệu = 10',
          lines: ['Số lớn = (70 + 10) : 2 = 40; Số bé = (70 - 10) : 2 = 30.'],
        },
      },
      {
        id: 'fractions',
        title: '3. Phân số, Rút gọn & So sánh',
        bullets: [
          'Nhân hoặc chia cả tử và mẫu với cùng số tự nhiên > 1 được phân số mới bằng phân số ban đầu.',
          'Cộng/trừ phân số khác mẫu: Quy đồng mẫu số rồi cộng/trừ tử số, giữ nguyên mẫu số.',
          'Nhân phân số: Tử × Tử, Mẫu × Mẫu. Chia phân số: Nhân với phân số đảo ngược.',
          'Tìm giá trị phân số của một số: Lấy số đó nhân với phân số. Tìm một số khi biết giá trị phân số: Lấy giá trị đó chia cho phân số.',
          'So sánh: Quy đồng mẫu/tử, chọn phân số trung gian, so sánh phần bù (nếu b - a = d - c), hoặc phần thừa (nếu a - b = c - d).',
        ],
      },
      {
        id: 'ratio-map',
        title: '4. Tổng – Tỉ, Hiệu – Tỉ & Tỉ lệ bản đồ',
        formulas: [
          {
            label: 'Tổng – Tỉ',
            formula: 'Giá trị 1 phần = Tổng : Tổng số phần bằng nhau',
          },
          {
            label: 'Hiệu – Tỉ',
            formula: 'Giá trị 1 phần = Hiệu : Hiệu số phần bằng nhau',
          },
          {
            label: 'Tỉ lệ bản đồ',
            formula: 'Độ dài thật = Độ dài bản đồ × Mẫu số tỉ lệ',
          },
        ],
        bullets: [
          'Tổng – Tỉ / Hiệu – Tỉ: Vẽ sơ đồ đoạn thẳng, tìm tổng (hoặc hiệu) số phần bằng nhau rồi tìm giá trị 1 phần.',
          'Tỉ lệ bản đồ 1 : N cho biết độ dài thật gấp N lần độ dài đo trên bản đồ (cùng đơn vị đo).',
        ],
        example: {
          title: 'Ví dụ Tỉ lệ bản đồ 1 : 1 000 000',
          lines: [
            'Trên bản đồ đo được 112 mm → Độ dài thật = 112 × 1 000 000 = 112 000 000 mm = 112 km.',
            'Quãng đường thật 41 km = 41 000 000 mm → Trên bản đồ dài 41 000 000 : 1 000 000 = 41 mm.',
          ],
        },
      },
    ],
  },
];
