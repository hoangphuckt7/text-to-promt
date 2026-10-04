import { AppSettings, Character, StoryPreset, TagItem } from '../types';

export const DEFAULT_STYLES: TagItem[] = [
  { id: 'sieuthuc', name: 'Siêu thực', fragment: 'hyperrealistic, ultra-detailed 8K resolution, photorealistic textures, volumetric atmosphere' },
  { id: 'chanthuc', name: 'Chân thực người thật', fragment: 'photorealistic cinematic live-action, natural skin tones, authentic real-world lighting, lifelike micro-expressions' },
  { id: 'phim', name: 'Phim', fragment: 'cinematic 35mm film grain, anamorphic lens flare, shallow depth of field, blockbuster movie aesthetic' },
  { id: 'disney', name: 'Hoạt hình Disney', fragment: 'classic Disney animation style, rich vibrant colors, expressive emotional character design, whimsical storybook charm' },
  { id: 'anime', name: 'Anime', fragment: 'Japanese modern high-budget anime aesthetic, crisp cel-shaded lines, dynamic cinematic lighting, Makoto Shinkai sky gradient' },
  { id: 'pixar', name: 'Pixar', fragment: '3D Pixar animated film style, soft subsurface scattering, tactile materials, warm cinematic lighting, exaggerated friendly proportions' },
  { id: 'truyentranh', name: 'Truyện tranh', fragment: 'vibrant comic book art, halftone dot shading, bold black ink outlines, dynamic graphic action angles' },
  { id: 'noir', name: 'Noir', fragment: 'classic Film Noir, high contrast chiaroscuro lighting, deep Venetian blind shadows, moody rain reflections, atmospheric smoke' },
  { id: 'cyberpunk', name: 'Cyberpunk', fragment: 'cyberpunk neo-noir, glowing holographic neon signs, reflective wet pavement, futuristic high-tech dystopian city' },
  { id: 'maunuoc', name: 'Màu nước', fragment: 'delicate watercolor illustration, bleeding soft color washes, subtle textured paper grain, artistic fluidity' },
  { id: 'lowpoly', name: 'Low-poly 3D', fragment: 'stylized low-poly 3D geometric art, faceted surfaces, clean gradient shading, pastel isometric palette' },
  { id: 'cartoon2d', name: 'Hoạt hình Cartoon 2D', fragment: 'fluid modern 2D cartoon animation, hand-drawn aesthetic, bold character silhouettes, snappy motion' },
  { id: 'cartoon3d', name: 'Hoạt hình Cartoon 3D', fragment: 'polished 3D cartoon render, stylized clay-like surfaces, expressive bouncy animation, warm playful tones' },
  { id: 'pixelart', name: 'Pixel Art', fragment: '16-bit retro pixel art, clean pixel clusters, nostalgic arcade color grading, crisp digital borders' },
  { id: 'isometric', name: 'Isometric', fragment: 'orthographic isometric camera angle, miniature diorama scale, crisp clean architectural lighting' },
  { id: 'papercutout', name: 'Paper Cutout', fragment: 'layered papercraft art, visible drop shadows between cutout layers, crafted paper fiber textures' },
  { id: 'claymation', name: 'Claymation', fragment: 'tactile stop-motion claymation, subtle plasticine fingerprints, frame-by-frame tactile movement, physical miniature set' },
  { id: 'lichsu', name: 'Lịch sử', fragment: 'historical period drama, authentic period costumes, antique sepia-tinged film grain, traditional architectural scenery' },
  { id: 'khoahoc', name: 'Khoa học', fragment: 'scientific visualization, clean high-tech UI overlays, microscopic lens precision, sterile laboratory illumination' },
  { id: 'congnghe', name: 'Công nghệ', fragment: 'futuristic sleek technological aesthetic, glowing fiber-optic data streams, clean brushed metal and glass textures' },
  { id: 'game', name: 'Trò chơi điện tử', fragment: 'Unreal Engine 5 AAA cinematic cutscene, real-time ray-traced reflections, immersive third-person gaming camera' },
  { id: 'giaoduc', name: 'Giáo dục', fragment: 'clear educational explainer visual, warm inviting daylight, illustrative focus on primary subjects' },
  { id: 'huongdan', name: 'Hướng dẫn', fragment: 'clean tutorial step-by-step presentation, top-down and close-up camera angles, crisp readable composition' },
  { id: 'review', name: 'Review sản phẩm', fragment: 'commercial product showcase, turntable rotation, macro lens detailing materials, softbox studio lighting' },
  { id: 'unbox', name: 'Unbox', fragment: 'crisp first-person unboxing perspective, pristine packaging unveiling, satisfying ASMR visual tactile close-ups' },
  { id: 'dulich', name: 'Du lịch', fragment: 'cinematic travel vlog, sweeping aerial drone vistas, vibrant golden hour sun flare, breathtaking natural landscapes' },
  { id: 'amthuc', name: 'Ẩm thực', fragment: 'gourmet food commercial cinematography, sizzling steam, glistening sauce texture, shallow macro focus' },
  { id: 'vlog', name: 'Vlog', fragment: 'authentic handheld cinematic vlog, natural movement, organic ambient audio cues, warm eye-level engagement' },
  { id: 'thethao', name: 'Thể thao', fragment: 'high-speed 120fps sports cinematography, frozen motion water droplets, dynamic whip pans, intense athletic grit' },
  { id: 'tintuc', name: 'Tin tức', fragment: 'broadcast journalism documentary camera, observational telephoto lens, natural authentic ambient daylight' },
  { id: 'phimngan', name: 'Phim ngắn', fragment: 'indie arthouse short film, contemplative slow camera push, naturalistic subdued color palette, emotional resonance' },
  { id: 'hoathinhngan', name: 'Hoạt hình ngắn', fragment: 'award-winning animated short film, poetic visual symbolism, hand-crafted painterly textures, expressive pacing' },
  { id: 'thuyetminh', name: 'Thuyết minh', fragment: 'authoritative BBC/Discovery style visual documentary footage, cinematic pacing matching spoken narrative tempo' },
  { id: 'doodle', name: 'Doodle Video', fragment: 'hand-drawn doodle cartoon sketch, animated line drawings evolving on paper, playful marker strokes' },
  { id: 'whiteboard', name: 'Whiteboard Video', fragment: 'sped-up hand drawing illustrations on pristine white dry-erase board, black and colored markers' },
  { id: 'infographic', name: 'Infographic Video', fragment: 'dynamic modern motion graphics, clean vector iconography, sleek animated graphs and fluid typography' },
  { id: 'phongvan', name: 'Video phỏng vấn', fragment: 'cinematic interview setup, 85mm portrait lens, gentle shallow background bokeh, flattering three-point lighting' },
  { id: 'tailieu', name: 'Video tài liệu', fragment: 'National Geographic documentary grade, candid non-staged captures, dramatic natural sunlight, epic telephoto framing' },
  { id: 'minecraft', name: 'Minecraft', fragment: 'blocky voxel Minecraft universe, charming pixelated textures, soft shader water reflections, sun shafts through cube clouds' },
  { id: 'quangcao', name: 'Video quảng cáo', fragment: 'luxury commercial advertising look, sleek glossy surfaces, flawless studio color grading, dramatic slow-motion' },
  { id: 'quansu', name: 'Quân sự', fragment: 'gritty military cinematic, muted olive drab and slate color grading, tactical bodycam and drone reconnaissance angles' },
  { id: 'tiensu', name: 'Người tiền sử', fragment: 'prehistoric primeval wilderness, misty dawn jungle, primitive bone and fur attire, glowing campfire embers' },
  { id: 'codai', name: 'Người cổ đại', fragment: 'ancient civilization epic, monumental stone temples, billowing linen robes, golden desert sunlight and torchlight' },
  { id: 'vietnam', name: 'Phong cách Việt Nam', fragment: 'Vietnamese cultural heritage aesthetic, misty limestone karst peaks, lush green rice terraces, traditional ao dai, golden nostalgic Indochine atmosphere' },
  { id: 'trailer', name: 'Trailer phim', fragment: 'epic Hollywood movie trailer pacing, rapid rhythmic camera cuts, explosive crescendos, dramatic high-contrast anamorphic visuals' },
];

export const DEFAULT_GENRES: TagItem[] = [
  { id: 'action', name: 'Hành động/Chiến đấu', fragment: 'fast-paced action choreographies, dynamic kinetic camera sweeps, impactful physical motion, heightened adrenaline' },
  { id: 'romance', name: 'Tình cảm/Lãng mạn', fragment: 'tender emotional intimacy, warm soft golden glow, lingering close-up gaze, gentle breeze and poetic mood' },
  { id: 'comedy', name: 'Hài hước/Vui nhộn', fragment: 'comedic timing, bright upbeat lighting, humorous expressive reactions, quirky character body language' },
  { id: 'horror', name: 'Kinh dị/Horror', fragment: 'chilling eerie horror, creeping dark shadows, oppressive claustrophobic atmosphere, ominous flickering light, unsettling suspense' },
  { id: 'mystery', name: 'Bí ẩn/Trinh thám', fragment: 'intriguing detective mystery, dense atmospheric fog, dim desk lamp illuminating cryptic clues, suspicious glances' },
  { id: 'fantasy', name: 'Fantasy/Thần thoại', fragment: 'high epic fantasy, magical glowing motes, ancient mystical runes, ethereal landscapes, majestic enchanted creatures' },
  { id: 'scifi', name: 'Khoa học viễn tưởng', fragment: 'speculative hard sci-fi, sleek starship corridors, zero-gravity debris, planetary rings visible through giant observation windows' },
  { id: 'drama', name: 'Drama/Chính kịch', fragment: 'heavy psychological drama, intimate character-focused cinematography, poignant facial tension, nuanced realistic conflict' },
  { id: 'edu', name: 'Giáo dục/Học tập', fragment: 'engaging educational narrative, clear visual demonstrations, inviting bright colors, structured logical flow' },
  { id: 'adventure', name: 'Phiêu lưu/Thám hiểm', fragment: 'grand adventurous expedition, uncharted wilderness, rugged terrain traversal, wide establishing camera angles' },
  { id: 'sliceoflife', name: 'Đời thường/Slice of Life', fragment: 'warm comforting slice of life, cozy afternoon sunlight through windows, quiet everyday rituals, heartwarming simplicity' },
  { id: 'trailer_genre', name: 'Trailer phim', fragment: 'high-stakes cinematic montage, rising dramatic tension, epic sound-designed visual beats, cinematic title card impact' },
];

export const DEFAULT_CHARACTERS: Character[] = [
  {
    id: 'char-1',
    name: 'Minh',
    description: 'Nam 32 tuổi, vóc dáng cao gầy, thám tử tư. Tóc hơi rối, ánh mắt sắc bén, có vết sẹo mờ ở đuôi mày trái. Mặc áo măng tô màu be sờn vai, bên trong là áo sơ mi trắng mở cúc cổ, quần âu xám.',
    voice: 'Giọng nam miền Nam trầm ấm, dứt khoát, điềm tĩnh',
  },
  {
    id: 'char-2',
    name: 'Mai',
    description: 'Nữ 26 tuổi, phóng viên điều tra năng động. Tóc đen cắt ngắn ngang vai buộc nửa đầu, đôi mắt to sáng thông minh. Mặc áo khoác jean sờn gấu, áo thun đen, đeo túi da chéo đựng máy ảnh cơ.',
    voice: 'Giọng nữ trẻ trung, lanh lợi, tự tin',
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  splitMode: 'speech_rate',
  wordsPerScene: 22,
  targetDurationMinutes: 'auto',
  customMinutes: 3,
  promptType: 'multi',
  promptLanguage: 'en', // Image models generate best with English prompts
  geminiModel: 'gemini-3.5-flash',
  promptDetail: 'medium',
  aspectRatio: '16:9',
  fixedPrefix: 'Cinematic filmic quality, realistic textures, highly detailed:',
  useSeed: false,
  seed: 42890,
  syncCharacters: true,
  alwaysCallByName: true,
  immutableCharacterDetails: true,
  copyFullCharacterSheet: true,
  useEmotionsAndExpressions: true,
  useCameraAndFraming: true,
  useLightingColor: true,
  syncOnlyPresentCharacters: true,
  includeVoiceLanguage: true,
  matchDurationPrompts: true,
  storyContinuityGoal: true,
  individualCharacterSheets: true,
  continuity: true,
  targetPlatform: 'image_and_motion',
};

export const SAMPLE_STORIES: StoryPreset[] = [
  {
    id: 'sample-preah-vihear',
    title: 'Bí ẩn đường biên giới & dãy Dângrêk',
    story: `Kịch bản thứ hai rủi ro và đáng sợ hơn rất nhiều: bất cứ khi nào tình hình chính trị nội bộ ở thủ đô Bangkok hoặc Phnom Penh gặp biến động, đối mặt với các cuộc bầu cử khó khăn hoặc sức ép từ dư luận, ngọn bài mang tên "bảo vệ chủ quyền Preah Vihear" sẽ lại được các chính trị gia thực dụng rút ra. Nó là công cụ quá hoàn hảo để kích động tinh thần dân tộc chủ nghĩa nhằm che lấp những yếu kém trong nước. Và chỉ cần một mồi lửa nhỏ trên bàn đàm phán hoặc một vụ nổ mìn tình cờ trên thực địa, tiếng súng pháo sẽ lại rền vang trên đỉnh dãy Dângrêk, nơi người dân vô tội hai bên biên giới lại phải gánh chịu bi kịch chiến tranh.

Thế nhưng, nếu bạn đi dọc theo dãy núi Dângrêk cheo leo về phía đông, bức tranh giao thương sầm uất đó biến mất hoàn toàn. Thay vào đó là những đồn bốt biên phòng ẩn khuất trong sương mù dày đặc và các biển cảnh báo bom mìn rải rác bên vệ đường. Minh đứng trên mỏm đá ngắm nhìn ngôi đền cổ sừng sững giữa biển mây. Anh rút chiếc máy ảnh cơ cũ kỹ ra và bấm máy ghi lại khoảnh khắc lịch sử này, trong khi gió rít từng hồi qua rặng thông già.`,
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: 'sample-mystery-saigon',
    title: 'Vụ án bức tranh biến mất ở Sài Gòn',
    story: `Cơn mưa rào đầu hạ trút xuống con hẻm cổ kính giữa lòng Sài Gòn, cuốn theo lớp bụi mù và làm nhòe ánh đèn vàng hắt ra từ phòng trưng bày tranh nghệ thuật. Thám tử Minh bước vào hiện trường, phủi nhẹ nước mưa trên chiếc áo măng tô quen thuộc. Trên bức tường nhung đỏ thắm, khung tranh bằng gỗ gụ thế kỷ 19 trống rỗng, chỉ còn lại một sợi chỉ vàng vướng vào góc nhọn.

Mai, nữ phóng viên trẻ có mặt từ trước, nhanh chóng đưa cho Minh tập tài liệu ghi chép lời khai nhân chứng. Cô chỉ tay về phía cửa sổ thông gió trên cao nơi có những vết xước kim loại còn rất mới. Minh cúi xuống, dùng chiếc kính lúp soi kỹ những hạt phấn hoa tím kỳ lạ vương vãi trên sàn gỗ mun. Một nụ cười kín đáo thoáng hiện trên gương mặt anh: manh mối đầu tiên của kẻ trộm thế kỷ đã lộ diện.`,
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
  },
  {
    id: 'sample-scifi-mars',
    title: 'Trạm vũ trụ Sao Hỏa 2088 - Tín hiệu lạ',
    story: `Năm 2088, bão cát đỏ cuộn xoáy quanh mái vòm kính của trạm nghiên cứu Valles Marineris trên bề mặt Sao Hỏa. Đại úy Elena đứng trước bảng điều khiển trung tâm, ngắm nhìn bầu trời màu hổ phách u ám. Bất ngờ, toàn bộ hệ thống cảm biến âm thanh rung lên bần bật khi nhận được một chuỗi sóng vô tuyến phát ra từ độ sâu 3.000 mét dưới lòng hẻm núi băng ngầm.

Tiến sĩ Vance chạy vội vào buồng chỉ huy với đôi mắt đỏ ngầu sau ca trực đêm. Ông kích hoạt màn hình quét ba chiều, để lộ cấu trúc kim loại khổng lồ có dạng hình học hoàn hảo đang thức giấc dưới lớp đất đóng băng vĩnh cửu. Đó không phải là một hiện tượng địa chất ngẫu nhiên. Nhân loại vừa chạm trán dấu vết đầu tiên của một nền văn minh đã ngủ quên hàng triệu năm.`,
    createdAt: Date.now() - 1000 * 60 * 60 * 72,
  },
  {
    id: 'sample-humor-cat',
    title: 'Buổi phỏng vấn xin việc của Mèo Quý Tộc',
    story: `Mèo béo Mochi trong bộ vest mini thắt nơ đỏ đường hoàng bước vào phòng phỏng vấn của tập đoàn công nghệ hàng đầu. Với vẻ mặt nghiêm nghị và ánh mắt kẻ cả, cậu nhảy phắt lên chiếc ghế xoay giám đốc đối diện bàn làm việc. Người phỏng vấn là anh Nam, trợn tròn mắt nhìn hồ sơ xin việc ứng tuyển vào vị trí "Chuyên viên kiểm định chất lượng giấc ngủ và đồ ăn vặt".

Mochi khẽ kêu "meow" một tiếng đầy uy quyền, đưa móng vuốt đẩy tách cà phê của anh Nam trượt sát mép bàn để biểu diễn định luật hấp dẫn. Toàn bộ căn phòng im phăng phắc trước sự tự tin tuyệt đối của ứng viên bốn chân. Anh Nam bật cười, đặt bút ký ngay vào hợp đồng tiếp nhận với mức lương vô số hộp cá ngừ thượng hạng mỗi ngày.`,
    createdAt: Date.now() - 1000 * 60 * 60 * 96,
  },
];
