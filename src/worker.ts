/**
 * 该代码是一个调用翻译接口的示例。
 *
 * 使用说明：
 * - 通过发送 POST 请求到 Cloudflare Workers 上的 API 端点来调用翻译接口。
 * - 请求的内容类型必须为 application/json。
 * - 请求体应包含以下字段：
 *   - source_lang: 源语言代码，如 "en" 表示英语。
 *   - target_lang: 目标语言代码，如 "zh" 表示中文。
 *   - text_list: 要翻译的文本列表。
 * - 示例请求体：
 *   {
 *     "source_lang": "en",
 *     "target_lang": "zh",
 *     "text_list": [
 *       "Hello, how are you?",
 *       "What is your name?"
 *     ]
 *   }
 * - 示例响应体：
 *   {
 *     "code": 200,
 *     "message": "Translation Successful",
 *     "data": [
 *       {
 *         "original": "Hello, how are you?",
 *         "original_length": 18,
 *         "result": "你好，你好吗？",
 *         "result_length": 7
 *       },
 *       {
 *         "original": "What is your name?",
 *         "original_length": 19,
 *         "result": "你叫什么名字？",
 *         "result_length": 7
 *       }
 *     ]
 *   }
 */

import { v4 as uuidv4 } from 'uuid';

// 定义环境变量类型
interface Env {
	// 添加你的环境变量类型定义
}

// 定义请求的 JSON 数据结构
interface JsonData {
	source_lang: string;
	target_lang: string;
	text_list: string[];
}

// 定义翻译结果的数据结构
interface TranslationResult {
	original: string;
	original_length: number;
	result: string;
	result_length: number;
}

// 定义错误响应的数据结构
interface ErrorResponse {
	code: number;
	message: string;
	data: any;
}

// 定义成功响应的数据结构
interface SuccessResponse {
	code: number;
	message: string;
	data: TranslationResult[];
}

// 生成随机的浏览器版本号
function getRandomBrowserVersion(): string {
	const majorVersion = Math.floor(Math.random() * 17) + 100;
	const minorVersion = Math.floor(Math.random() * 20);
	const patchVersion = Math.floor(Math.random() * 20);
	return `${majorVersion}.${minorVersion}.${patchVersion}`;
}

// 生成随机的操作系统
function getRandomOperatingSystem(): string {
	const operatingSystems = ['Mac OS', 'Windows'];
	const randomIndex = Math.floor(Math.random() * operatingSystems.length);
	return operatingSystems[randomIndex];
}

// 检查请求方法是否为 POST
function isPostMethod(request: Request): boolean {
	return request.method === 'POST';
}

// 检查请求方法是否为 OPTIONS
function isOptionsMethod(request: Request): boolean {
	return request.method === 'OPTIONS';
}

// 检查请求内容是否为 JSON
function isJsonContent(request: Request): boolean {
	const contentType = request.headers.get('Content-Type');
	return contentType === 'application/json';
}

// 解析 JSON 请求体
async function parseJsonRequest(request: Request): Promise<JsonData> {
	const body = await request.json();
	return body as JsonData;
}

// 验证 JSON 数据的结构和字段
function validateJsonData(data: JsonData): boolean {
	const { source_lang, target_lang, text_list } = data;

	if (typeof source_lang !== 'string' || typeof target_lang !== 'string') {
		return false;
	}

	if (!Array.isArray(text_list) || text_list.length < 1) {
		return false;
	}

	for (const text of text_list) {
		if (typeof text !== 'string' || text.trim() === '') {
			return false;
		}
	}

	return true;
}

// 构造翻译请求
function constructTranslationRequest(sourceLang: string, textList: string[], targetLang: string) {
	const clientKey = `browser-chrome-${getRandomBrowserVersion()}-${getRandomOperatingSystem()}-${uuidv4()}-${Date.now()}`;

	const translationRequest = {
		header: {
			fn: 'auto_translation',
			session: '',
			client_key: clientKey,
			user: '',
		},
		type: 'plain',
		model_category: 'normal',
		text_domain: '',
		source: {
			lang: sourceLang,
			text_list: textList,
		},
		target: {
			lang: targetLang,
		},
	};

	return translationRequest;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// 检查请求方法是否为 OPTIONS
		if (isOptionsMethod(request)) {
			// 构造成功响应
			const successResponse: SuccessResponse = {
				code: 200,
				message: 'OK',
				data: [],
			};

			const resBody = JSON.stringify(successResponse);
			const resHeaders = new Headers({
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type',
			});
			const res = new Response(resBody, {
				status: 200,
				headers: resHeaders,
			});

			return res;
		}

		// 检查请求方法是否为 POST
		if (!isPostMethod(request)) {
			const errorResponse: ErrorResponse = {
				code: 400,
				message: 'Invalid Request Method. Only POST method is allowed.',
				data: null,
			};
			return new Response(JSON.stringify(errorResponse), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// 检查请求内容是否为 JSON
		if (!isJsonContent(request)) {
			const errorResponse: ErrorResponse = {
				code: 400,
				message: 'Invalid Request Content Type. Only JSON content is allowed.',
				data: null,
			};
			return new Response(JSON.stringify(errorResponse), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// 解析 JSON 请求体
		const jsonData = await parseJsonRequest(request);

		// 验证 JSON 数据的结构和字段
		if (!validateJsonData(jsonData)) {
			const errorResponse: ErrorResponse = {
				code: 400,
				message: 'Invalid JSON Data. Please provide valid source_lang, target_lang, and non-empty text_list.',
				data: null,
			};
			return new Response(JSON.stringify(errorResponse), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// 在这里添加你的其他逻辑处理

		const sourceLang = jsonData.source_lang;
		const textList = jsonData.text_list;
		const targetLang = jsonData.target_lang;

		// 构造翻译请求
		const translationRequest = constructTranslationRequest(sourceLang, textList, targetLang);

		// 发送 POST 请求
		const url = 'https://transmart.qq.com/api/imt';
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(translationRequest),
		});

		// 检查响应的状态码
		if (response.status !== 200) {
			const errorResponse: ErrorResponse = {
				code: response.status,
				message: `HTTP Error: ${response.status}`,
				data: null,
			};
			return new Response(JSON.stringify(errorResponse), {
				status: response.status,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// 解析 URL 响应的内容
		const responseBody = (await response.json()) as { header: { ret_code: string }; auto_translation: any };

		// 检查翻译是否成功
		if (responseBody.header.ret_code !== 'succ') {
			const errorResponse: ErrorResponse = {
				code: response.status,
				message: 'Translation Error',
				data: null,
			};
			return new Response(JSON.stringify(errorResponse), {
				status: response.status,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// 构造成功响应的 data 字段
		const translationResults: TranslationResult[] = textList.map((text, index) => ({
			original: text,
			original_length: text.length,
			result: responseBody.auto_translation[index],
			result_length: responseBody.auto_translation[index].length,
		}));

		// 构造成功响应
		const successResponse: SuccessResponse = {
			code: 200,
			message: 'Translation Successful',
			data: translationResults,
		};

		const resBody = JSON.stringify(successResponse);
		const resHeaders = new Headers({
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		});
		const res = new Response(resBody, {
			status: 200,
			headers: resHeaders,
		});

		return res;
	},
};
