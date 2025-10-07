
import { GoogleGenAI, Type } from "@google/genai";
import type { LessonDetails, Slide } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getCreativityInstruction = (creativity: string): string => {
  switch (creativity) {
    case 'Thực tế':
      return 'Tập trung vào các phương pháp giảng dạy truyền thống và thông tin thực tế. Tránh các phép loại suy phức tạp hoặc các hoạt động quá sáng tạo.';
    case 'Sáng tạo cao':
      return 'Sử dụng các phép loại suy độc đáo, các hoạt động đổi mới và cách tiếp cận kể chuyện để làm cho bài học trở nên hấp dẫn. Đừng ngại đề xuất các ý tưởng độc đáo.';
    case 'Cân bằng':
    default:
      return 'Kết hợp các phương pháp giảng dạy đáng tin cậy với các yếu tố sáng tạo để giữ cho học sinh hứng thú.';
  }
};

const getVerbosityInstruction = (verbosity: string): string => {
  switch (verbosity) {
    case 'Ngắn gọn':
      return 'Giữ cho kịch bản ngắn gọn và đi thẳng vào vấn đề. Ưu tiên sự rõ ràng và hiệu quả hơn là các giải thích dài dòng.';
    case 'Toàn diện':
      return 'Cung cấp một kịch bản rất chi tiết với các giải thích sâu sắc, các điểm thảo luận bổ sung và các câu trả lời tiềm năng cho các câu hỏi của học sinh. Bao quát chủ đề một cách toàn diện.';
    case 'Chi tiết':
    default:
      return 'Cung cấp một lượng chi tiết cân bằng, bao gồm các giải thích rõ ràng và đủ thông tin cho một bài học đầy đủ mà không làm học sinh quá tải.';
  }
};

const buildPrompt = (details: LessonDetails, areFilesProvided: boolean): string => {
  const grade = parseInt(details.gradeLevel.replace('Lớp ', ''), 10);
  const periodDuration = (grade >= 6 && grade <= 9) ? 45 : 35;
  const numberOfPeriods = parseInt(details.numberOfPeriods, 10) || 1;
  const totalDuration = numberOfPeriods * periodDuration;

  const multiPeriodInstruction = numberOfPeriods > 1
    ? `
    **LƯU Ý QUAN TRỌNG VỀ BÀI DẠY NHIỀU TIẾT:**
    - Bài dạy này kéo dài **${numberOfPeriods} tiết**. Tổng thời lượng là **${totalDuration} phút**.
    - Bạn phải thiết kế một chuỗi các hoạt động liền mạch, logic trải dài qua tất cả các tiết.
    - **Cực kỳ quan trọng:** Phân chia nội dung và hoạt động một cách hợp lý. **Mỗi tiết học phải được trình bày riêng biệt**, bắt đầu bằng tiêu đề rõ ràng (ví dụ: "TIẾT 1: [Tên chủ đề của tiết 1]").
    - **Trong mỗi tiết**, bạn phải đảm bảo có đủ các bước sư phạm cần thiết (Khởi động/Kết nối, Hình thành kiến thức, Luyện tập, Vận dụng, Củng cố). Hoạt động khởi động của các tiết sau (từ tiết 2 trở đi) nên tập trung vào việc ôn lại kiến thức của tiết trước và tạo cầu nối sang nội dung mới của tiết hiện tại.
    - Phân bổ thời gian cho các hoạt động trong từng tiết phải hợp lý, đảm bảo tổng thời gian của mỗi tiết là **${periodDuration} phút**.
    `
    : '';
    
  const fileInstruction = areFilesProvided
    ? "Nhiệm vụ của bạn là phân tích các tài liệu được cung cấp (có thể là giáo án, trang sách, hoặc hình ảnh) và tạo ra một kịch bản thuyết trình chi tiết, hấp dẫn và phù hợp với lứa tuổi cho giáo viên. Hãy sử dụng các tài liệu này làm nguồn thông tin chính."
    : "Nhiệm vụ của bạn là tạo ra một kịch bản thuyết trình chi tiết, hấp dẫn và phù hợp với lứa tuổi cho giáo viên dựa trên các chi tiết kế hoạch bài học được cung cấp.";

  const creativityInstruction = getCreativityInstruction(details.creativity);
  const verbosityInstruction = getVerbosityInstruction(details.verbosity);

  return `
    Bạn là một chuyên gia soạn giáo án tiểu học hàng đầu, chuyên tạo ra các kịch bản bài giảng (giáo án) chi tiết, hấp dẫn và tuân thủ chặt chẽ theo **Chương trình giáo dục phổ thông 2018 của Việt Nam**, tập trung vào việc phát triển năng lực và phẩm chất của học sinh.
    ${fileInstruction}

    ${multiPeriodInstruction}

    **YÊU CẦU CẤU TRÚC TỔNG THỂ CỦA GIÁO ÁN:**
    Giáo án phải bao gồm hai phần chính:
    1.  **Phần đầu:** Thông tin chung, Yêu cầu cần đạt và Đồ dùng dạy học.
    2.  **Phần thân:** Chi tiết các hoạt động dạy và học, trình bày dưới dạng bảng hai cột và tuân theo cấu trúc 5 bước sư phạm.

    ---

    **PHẦN 1: THÔNG TIN CHUNG, YÊU CẦU, ĐỒ DÙNG**

    **Yêu cầu định dạng:**
    - Trình bày chính xác theo các mục dưới đây.
    - Từ **Mục tiêu học tập** được cung cấp, hãy suy luận và viết chi tiết cho mục **I. YÊU CẦU CẦN ĐẠT**, phân tách rõ ràng thành 3 phần: Năng lực đặc thù, Năng lực chung, và Phẩm chất, bám sát các yêu cầu của Chương trình GDPT 2018.
    - Tự suy luận và điền thông tin hợp lý cho mục **II. ĐỒ DÙNG DẠY HỌC**.

    **Ví dụ định dạng đầu ra mong muốn cho Phần 1:**

    Môn: Toán
    Bài dạy: Luyện tập Số thập phân
    Lớp: 5
    Số tiết: ${details.numberOfPeriods}
    Thời lượng: ${periodDuration} phút/tiết

    **I. YÊU CẦU CẦN ĐẠT:**
    **1. Năng lực đặc thù:** 
    - HS nhận biết được hàng của số thập phân; đọc, viết được số thập phân.
    - HS vận dụng được việc nhận biết hàng của số thập phân; đọc, viết được số thập phân trong một số tình huống thực tế.
    - HS có cơ hội phát triển năng lực tư duy toán học và năng lực giao tiếp toán học.
    **2. Năng lực chung.**
    - Năng lực tự chủ, tự học: Chủ động tích cực tìm hiểu và viết được hàng của số thập phân; đọc, viết được số thập phân.
    - Năng lực giải quyết vấn đề và sáng tạo: Biết vận dụng được viết số tự nhiên thành tổng để giải quyết một số tình huống thực tế.
    - Năng lực giao tiếp và hợp tác: Có thói quen trao đổi, thảo luận cùng nhau hoàn thành nhiệm vụ dưới sự hướng dẫn của giáo viên.
    **3. Phẩm chất.**
    - Phẩm chất chăm chỉ: Ham học hỏi tìm tòi để hoàn thành tốt nội dung học tập.
    - Phẩm chất trách nhiệm: Có ý thức trách nhiệm với lớp, tôn trọng tập thể.
    **II. ĐỒ DÙNG DẠY HỌC** 
    - **GV:** SGK, kế hoạch bài và các thiết bị, học liệu và đồ dùng phục vụ cho tiết dạy.
    - **HS:** SGK, vở ghi.

    ---

    **PHẦN 2: CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU**

    **Yêu cầu về cấu trúc và nội dung sư phạm:**
    - **Cấu trúc 5 bước:** Phải thiết kế các hoạt động theo đúng 5 bước của một tiết học hiện đại:
        1.  **HOẠT ĐỘNG KHỞI ĐỘNG:** Gây hứng thú, kết nối bài cũ - bài mới.
        2.  **HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC MỚI (KHÁM PHÁ):** Tổ chức cho học sinh tự tìm tòi, khám phá kiến thức.
        3.  **HOẠT ĐỘNG LUYỆN TẬP:** Rèn luyện kỹ năng, áp dụng kiến thức vừa học.
        4.  **HOẠT ĐỘNG VẬN DỤNG:** Khuyến khích học sinh áp dụng kiến thức vào tình huống thực tế.
        5.  **HOẠT ĐỘNG CỦNG CỐ, DẶN DÒ:** Hệ thống hóa kiến thức, giao nhiệm vụ về nhà.
    - **Định dạng bảng 2 cột:** Mỗi hoạt động phải được trình bày trong bảng markdown 2 cột: "Hoạt động của giáo viên" và "Hoạt động của học sinh".
    - **Chi tiết và thực tiễn:**
        - **Hoạt động của giáo viên:** Mô tả rõ ràng từng bước (lời nói, hành động, câu hỏi gợi mở, cách tổ chức...). Tích hợp các kỹ thuật đánh giá thường xuyên (quan sát, đặt câu hỏi, nhận xét sản phẩm...). Gợi ý phương án hỗ trợ học sinh gặp khó khăn hoặc thử thách cho học sinh khá giỏi.
        - **Hoạt động của học sinh:** Mô tả chi tiết các hành động tương ứng (lắng nghe, trả lời, thảo luận nhóm, làm bài tập, báo cáo...).
    - **Tiêu đề rõ ràng:** Mỗi hoạt động lớn phải có tiêu đề in đậm và ghi rõ thời gian dự kiến (ví dụ: **I. HOẠT ĐỘNG KHỞI ĐỘNG (3-5 phút)**).
    - **Ký hiệu:** Sử dụng **[GV]** và **[HS]** để làm rõ.

    **Ví dụ định dạng đầu ra mong muốn cho Phần 2:**

    **I. HOẠT ĐỘNG KHỞI ĐỘNG (3-5 phút)**
    *   **Mục tiêu:** Tạo không khí vui vẻ, kết nối kiến thức cũ, dẫn dắt vào bài mới.
    *   **Cách tiến hành:**

    | HOẠT ĐỘNG CỦA GIÁO VIÊN | HOẠT ĐỘNG CỦA HỌC SINH |
    |--------------------------|------------------------|
    | - **[GV]** Tổ chức trò chơi "Ai nhanh hơn?" để ôn lại bảng nhân 2. **[GV]** Chiếu câu hỏi lên màn hình. | - **[HS]** Hào hứng tham gia trò chơi. |
    | - **[GV]** Nhận xét, tuyên dương. Đặt câu hỏi: "Khi muốn lấy 2 cái bánh 3 lần, ta làm phép tính gì?" Dẫn dắt vào bài học mới. | - **[HS]** Trả lời: "Phép nhân 2x3 ạ". Lắng nghe GV giới thiệu bài mới. |

    ---

    **THÔNG TIN BÀI HỌC ĐỂ SOẠN GIÁO ÁN:**
    - **Chủ đề (Bài dạy):** ${details.topic}
    - **Cấp lớp:** ${details.gradeLevel}
    - **Số tiết:** ${details.numberOfPeriods}
    - **Tổng thời lượng:** ${totalDuration} phút (${details.numberOfPeriods} tiết x ${periodDuration} phút/tiết)
    - **Mục tiêu học tập (Dùng để phát triển mục I. YÊU CẦU CẦN ĐẠT):**
      ${details.objectives}
    - **Nội dung chính cần đề cập:** ${details.keyConcepts}
    - **Gợi ý Hoạt động trong lớp:** ${details.activities}
    - **Giọng điệu mong muốn:** ${details.tone}
    - **Mức độ sáng tạo:** ${creativityInstruction}
    - **Mức độ chi tiết:** ${verbosityInstruction}

    Dựa vào thông tin được cung cấp, hãy tạo giáo án hoàn chỉnh theo đúng cấu trúc và định dạng yêu cầu. Bắt đầu với phần "Môn:".
  `;
};

export const generatePresentationScript = async (
  details: LessonDetails,
  files?: { mimeType: string; data: string }[]
): Promise<string> => {
  try {
    const prompt = buildPrompt(details, !!files && files.length > 0);

    if (files && files.length > 0) {
      const fileParts = files.map(file => ({
        inlineData: {
          mimeType: file.mimeType,
          data: file.data,
        },
      }));
      const textPart = { text: prompt };
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [...fileParts, textPart] }],
      });
      return response.text;
    } else {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    }
  } catch (error) {
    console.error("Error generating script with Gemini API:", error);
    throw new Error("Không thể tạo kịch bản thuyết trình. Vui lòng kiểm tra API key, kết nối mạng và định dạng tệp của bạn.");
  }
};

export const generateSlidesFromScript = async (script: string): Promise<Slide[]> => {
  try {
    const prompt = `
      Bạn là một chuyên gia thiết kế bài giảng bậc thầy, có kỹ năng biến các kịch bản giảng dạy chi tiết thành các slide trình bày rõ ràng, hấp dẫn và có hình ảnh thu hút cho học sinh nhỏ tuổi.
      Kịch bản được cung cấp có cấu trúc dạng bảng markdown hai cột, phác thảo các hoạt động của giáo viên và học sinh.
      Nhiệm vụ của bạn là phân tích kỹ lưỡng kịch bản này và tạo ra một chuỗi các slide tương ứng, tuân thủ nghiêm ngặt định dạng JSON được yêu cầu.

      Đối với mỗi slide, hãy xây dựng nội dung chi tiết như sau:
      1.  **title**: Tiêu đề phải tương ứng trực tiếp với các tiêu đề hoạt động chính trong kịch bản (ví dụ: "I. HOẠT ĐỘNG KHỞI ĐỘNG (4 - 5 phút)", "II. HÌNH THÀNH KIẾN THỨC MỚI", v.v.).
      2.  **content**: Trích xuất và tóm tắt các điểm chính, câu hỏi hoặc hướng dẫn *quan trọng nhất* từ kịch bản mà học sinh cần nhìn thấy trên màn hình. Giữ nội dung ngắn gọn, súc tích, sử dụng các gạch đầu dòng ngắn. **Đặc biệt quan trọng**: Đối với các slide chứa bài tập hoặc câu hỏi luyện tập, hãy trình bày rõ ràng cả **đề bài** và **lời giải** hoặc **đáp án** ngay trên cùng một slide. Cấu trúc này giúp học sinh dễ dàng theo dõi và đối chiếu. Đây là thông tin "dành cho học sinh".
      3.  **speakerNotes**: Đây là phần cực kỳ quan trọng. Hãy lấy các hướng dẫn chi tiết từ cột 'HOẠT ĐỘNG CỦA GIÁO VIÊN' cho phần tương ứng của kịch bản. Nội dung này phải là một bản hướng dẫn gần như nguyên văn cho giáo viên, cho họ biết chính xác phải nói gì và làm gì. Bao gồm các gợi ý cho câu hỏi và các tương tác mong đợi của học sinh.
      4.  **visualSuggestion**: Cung cấp một ý tưởng hình ảnh *cụ thể và sáng tạo*. Thay vì "một hình ảnh về cái cây", hãy đề xuất "Một video tua nhanh thời gian về một hạt đậu nảy mầm" hoặc "Một sơ đồ hoạt hình đầy màu sắc cho thấy các bộ phận của bông hoa". Trong phần 'rationale', hãy giải thích rõ ràng ý tưởng hình ảnh này hỗ trợ trực tiếp cho mục tiêu học tập của slide như thế nào.

      Hãy đảm bảo rằng chuỗi các slide tuân theo logic của kịch bản bài học từ đầu đến cuối, bao gồm tất cả các hoạt động chính. Đầu ra phải là một mảng JSON hợp lệ gồm các đối tượng slide.

      Kịch bản cần phân tích:
      ---
      ${script}
      ---
    `;
    
    const responseSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "Tiêu đề của slide."
          },
          content: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
            description: "Danh sách các gạch đầu dòng chính cho nội dung của slide."
          },
          speakerNotes: {
            type: Type.STRING,
            description: "Ghi chú chi tiết cho người trình bày để giải thích thêm về nội dung."
          },
          visualSuggestion: {
            type: Type.OBJECT,
            description: "Gợi ý về hình ảnh hoặc sơ đồ để minh họa cho slide, bao gồm cả lý do.",
            properties: {
                suggestion: {
                    type: Type.STRING,
                    description: "Gợi ý cụ thể về hình ảnh hoặc sơ đồ."
                },
                rationale: {
                    type: Type.STRING,
                    description: "Giải thích tại sao gợi ý này phù hợp và hiệu quả."
                }
            },
            required: ["suggestion", "rationale"]
          }
        },
        required: ["title", "content", "speakerNotes", "visualSuggestion"]
      }
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema,
      }
    });
    
    const jsonString = response.text;
    return JSON.parse(jsonString) as Slide[];

  } catch (error) {
    console.error("Error generating slides with Gemini API:", error);
    throw new Error("Không thể tạo slides. Vui lòng thử lại.");
  }
};


export const extractObjectivesFromFiles = async (
  files: { mimeType: string; data: string }[]
): Promise<string> => {
  try {
    const prompt = "Bạn là một trợ lý giáo dục AI. Hãy phân tích kỹ lưỡng (các) tài liệu được cung cấp và trích xuất các mục tiêu học tập chính. Liệt kê mỗi mục tiêu trên một dòng riêng biệt, bắt đầu bằng số thứ tự (1., 2., 3., ...). Nếu không tìm thấy mục tiêu nào, hãy trả về một chuỗi trống.";
    
    const fileParts = files.map(file => ({
      inlineData: {
        mimeType: file.mimeType,
        data: file.data,
      },
    }));
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [...fileParts, textPart] }],
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error extracting objectives with Gemini API:", error);
    throw new Error("Không thể trích xuất mục tiêu từ tệp.");
  }
};

export const extractKeyConceptsFromFiles = async (
  files: { mimeType: string; data: string }[]
): Promise<string> => {
  try {
    const prompt = "Bạn là một trợ lý giáo dục AI. Hãy phân tích kỹ lưỡng (các) tài liệu được cung cấp và trích xuất các khái niệm hoặc thuật ngữ chính quan trọng nhất. Liệt kê chúng thành một danh sách duy nhất, cách nhau bằng dấu phẩy. Ví dụ: Khái niệm A, Khái niệm B, Khái niệm C. Nếu không tìm thấy khái niệm nào, hãy trả về một chuỗi trống.";
    
    const fileParts = files.map(file => ({
      inlineData: {
        mimeType: file.mimeType,
        data: file.data,
      },
    }));
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [...fileParts, textPart] }],
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error extracting key concepts with Gemini API:", error);
    throw new Error("Không thể trích xuất các khái niệm chính từ tệp.");
  }
};

export const extractActivitiesFromFiles = async (
  files: { mimeType: string; data: string }[],
  details: LessonDetails
): Promise<string> => {
  try {
    const numberOfPeriods = parseInt(details.numberOfPeriods, 10) || 1;
    const multiPeriodInstruction = numberOfPeriods > 1
      ? `Bài học này được thiết kế cho ${numberOfPeriods} tiết. Hãy đề xuất các hoạt động sáng tạo, hấp dẫn và có tính kết nối, phân bổ hợp lý cho từng tiết. Ví dụ: "Tiết 1: Thảo luận nhóm, Tiết 2: Đóng vai tình huống, Tiết 3: Dự án nhỏ".`
      : 'Hãy đề xuất 2-3 hoạt động sáng tạo và hấp dẫn cho lớp học.';
      
    const prompt = `Bạn là một trợ lý giáo dục AI. Dựa trên nội dung của (các) tài liệu được cung cấp, hãy đề xuất các hoạt động cho lớp học.
${multiPeriodInstruction}
Các hoạt động này có thể bao gồm thảo luận nhóm, thí nghiệm thực hành, câu đố nhanh, đóng vai, v.v. Trình bày các ý tưởng dưới dạng một danh sách ngắn gọn, cách nhau bằng dấu phẩy. Nếu không có ý tưởng nào, hãy trả về chuỗi trống.`;
    
    const fileParts = files.map(file => ({
      inlineData: {
        mimeType: file.mimeType,
        data: file.data,
      },
    }));
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [...fileParts, textPart] }],
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error extracting activities with Gemini API:", error);
    throw new Error("Không thể trích xuất các hoạt động được gợi ý từ tệp.");
  }
};
