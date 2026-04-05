import type { Recipe } from '@/types'
import { getImageGenerationConfig } from '@/utils/apiConfig'

export interface GeneratedImage {
    url: string
    id: string
}

export const generateRecipeImage = async (recipe: Recipe): Promise<GeneratedImage> => {
    // 从设置中获取图片生成配置
    const config = getImageGenerationConfig()

    // 构建图片生成的提示词
    const prompt = buildImagePrompt(recipe)

    // 智谱 CogView 模型推荐尺寸
    const sizeToUse = "1024x1024"

    // 确保 URL 包含正确的 endpoint
    const url = config.baseUrl.endsWith('/') 
        ? `${config.baseUrl}images/generations` 
        : `${config.baseUrl}/images/generations`

    try {
        console.log('正在请求图片生成...', { url, model: config.model });
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model,
                prompt: prompt,
                size: sizeToUse
            })
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('图片 API 错误详情:', errorData);
            throw new Error(`API请求失败: ${response.status} - ${JSON.stringify(errorData)}`)
        }

        const data = await response.json()
        console.log('图片生成成功:', data);

        // 智谱 AI 返回格式处理
        if (data.data && data.data[0] && data.data[0].url) {
            return {
                url: data.data[0].url,
                id: `${recipe.id}-${Date.now()}`
            }
        } else {
            throw new Error('API返回数据格式中未找到图片URL')
        }
    } catch (error) {
        console.error('生成图片详细失败:', error)
        throw error
    }
}

const buildImagePrompt = (recipe: Recipe): string => {
    // 根据菜谱信息构建详细的图片生成提示词
    const ingredients = recipe.ingredients.join('、')
    const cuisineStyle = recipe.cuisine.replace('大师', '').replace('菜', '')

    return `一道精美的${cuisineStyle}菜肴：${recipe.name}，主要食材包括${ingredients}。菜品摆盘精致，色彩丰富，光线柔和，专业美食摄影风格，高清画质，餐厅级别的视觉效果。背景简洁，突出菜品本身的美感。`
}
