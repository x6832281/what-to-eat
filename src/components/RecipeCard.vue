<template>
    <div class="bg-white border-[3px] border-[#0A0910] rounded-2xl overflow-hidden neo-shadow mb-6 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#0A0910] transition-all duration-200">
        <!-- 菜谱头部 -->
        <div class="bg-gradient-to-r from-yellow-300 to-yellow-400 p-6 border-b-[3px] border-[#0A0910] flex justify-between items-start">
            <div>
                <div class="flex items-center gap-3 mb-2">
                    <span class="bg-black text-white text-xs font-black px-2 py-1 rounded uppercase tracking-wider">{{ recipe.cuisine }}</span>
                    <div class="flex items-center gap-1">
                        <span v-for="i in 3" :key="i" :class="['text-sm', i <= (recipe.difficulty === 'easy' ? 1 : recipe.difficulty === 'medium' ? 2 : 3) ? 'text-black' : 'text-black/20']">🔥</span>
                    </div>
                </div>
                <h3 class="text-3xl font-black text-black leading-tight">{{ recipe.name }}</h3>
            </div>
            <div class="flex flex-col items-end gap-2">
                <div class="bg-white border-2 border-black px-3 py-1 rounded-lg font-bold text-sm shadow-[2px_2px_0px_0px_#000]">
                    ⏱️ {{ recipe.cookingTime }} min
                </div>
                <button
                    v-if="showFavoriteButton"
                    @click="toggleFavorite"
                    class="w-12 h-12 rounded-full border-[3px] border-black flex items-center justify-center transition-all duration-200 active:scale-90"
                    :class="isFavorited ? 'bg-red-500 text-white shadow-[2px_2px_0px_0px_#000]' : 'bg-white text-black hover:bg-red-50 shadow-[4px_4px_0px_0px_#000]'"
                >
                    <span class="text-2xl">{{ isFavorited ? '❤️' : '🤍' }}</span>
                </button>
            </div>
        </div>

        <div class="p-6 md:p-8 space-y-8">
            <!-- 食材区域 -->
            <section>
                <h4 class="text-xl font-black mb-4 flex items-center gap-2">
                    <span class="w-8 h-8 bg-green-400 rounded-lg border-2 border-black flex items-center justify-center text-lg">🥬</span>
                    所需食材
                </h4>
                <div class="flex flex-wrap gap-3">
                    <div
                        v-for="item in recipe.ingredients"
                        :key="item"
                        class="bg-yellow-100 border-2 border-black px-4 py-2 rounded-xl font-bold text-sm hover:bg-yellow-200 transition-colors cursor-default"
                    >
                        {{ item }}
                    </div>
                </div>
            </section>

            <!-- 制作步骤 -->
            <section>
                <h4 class="text-xl font-black mb-4 flex items-center gap-2">
                    <span class="w-8 h-8 bg-blue-400 rounded-lg border-2 border-black flex items-center justify-center text-lg">📝</span>
                    制作步骤
                </h4>
                <div class="space-y-4">
                    <div
                        v-for="(step, index) in recipe.steps"
                        :key="index"
                        class="flex gap-4 p-4 bg-gray-50 border-2 border-black rounded-xl hover:bg-white transition-colors group"
                    >
                        <div class="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-black italic group-hover:scale-110 transition-transform">
                            {{ index + 1 }}
                        </div>
                        <div class="flex-1 pt-1">
                            <p class="text-gray-800 leading-relaxed font-medium">{{ step.description }}</p>
                            <div v-if="step.time || step.temperature" class="mt-2 flex gap-3">
                                <span v-if="step.time" class="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded border border-blue-200">⏱️ {{ step.time }}分</span>
                                <span v-if="step.temperature" class="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded border border-orange-200">🔥 {{ step.temperature }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 大师贴士 -->
            <section v-if="recipe.tips && recipe.tips.length > 0">
                <div class="bg-indigo-50 border-[3px] border-indigo-500 rounded-2xl p-6 relative overflow-hidden">
                    <div class="absolute -right-4 -bottom-4 opacity-10 grayscale">
                        <span class="text-8xl">👨‍🍳</span>
                    </div>
                    <h4 class="text-indigo-900 font-black mb-3 flex items-center gap-2">
                        <span>💡</span> 大师贴士
                    </h4>
                    <ul class="space-y-2 relative z-10">
                        <li v-for="tip in recipe.tips" :key="tip" class="text-indigo-800 text-sm font-bold flex gap-2">
                            <span class="text-indigo-400">●</span> {{ tip }}
                        </li>
                    </ul>
                </div>
            </section>

            <!-- 菜品效果图 -->
            <section v-if="recipe.id">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-xl font-black flex items-center gap-2">
                        <span class="w-8 h-8 bg-pink-400 rounded-lg border-2 border-black flex items-center justify-center text-lg">🖼️</span>
                        菜品效果图
                    </h4>
                    <button
                        v-if="!generatedImage && !isGeneratingImage"
                        @click="generateImage"
                        class="px-4 py-2 bg-black text-white rounded-lg font-bold text-sm hover:bg-gray-800 active:scale-95 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
                    >
                        ✨ AI 绘图
                    </button>
                </div>

                <!-- 图片显示区域 -->
                <div class="border-[3px] border-black rounded-2xl overflow-hidden bg-gray-100 min-h-[300px] flex items-center justify-center relative group">
                    <div v-if="isGeneratingImage" class="flex flex-col items-center gap-4 p-8 text-center">
                        <div class="w-16 h-16 border-4 border-black border-t-pink-500 rounded-full animate-spin"></div>
                        <p class="font-black text-black animate-pulse">AI 画师正在挥毫泼墨...</p>
                    </div>
                    <div v-else-if="imageError" class="p-8 text-center">
                        <span class="text-4xl mb-4 block">😅</span>
                        <p class="text-red-500 font-bold mb-4">{{ imageError }}</p>
                        <button @click="generateImage" class="text-blue-600 underline font-bold">重新尝试</button>
                    </div>
                    <div v-else-if="generatedImage" class="relative w-full">
                        <img :src="generatedImage.url" :alt="recipe.name" class="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <a :href="generatedImage.url" target="_blank" class="bg-white border-2 border-black px-4 py-2 rounded-lg font-black text-sm hover:bg-yellow-400">查看大图</a>
                        </div>
                    </div>
                    <div v-else class="text-gray-400 font-bold flex flex-col items-center gap-2">
                        <span class="text-6xl opacity-20">🥘</span>
                        <p>点击按钮生成 AI 效果图</p>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue'
import type { Recipe } from '@/types'
import { generateRecipeImage, type GeneratedImage } from '@/services/imageService'
import { getNutritionAnalysis, getWinePairing } from '@/services/aiService'
import type { GalleryImage } from '@/services/galleryService'
import FavoriteButton from './FavoriteButton.vue'
import NutritionAnalysis from './NutritionAnalysis.vue'
import WinePairing from './WinePairing.vue'
import ImageModal from './ImageModal.vue'

interface Props {
    recipe: Recipe
    showFavoriteButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    showFavoriteButton: true
})

const emit = defineEmits<{
    favoriteChanged: [isFavorited: boolean]
}>()
const isExpanded = ref(false)
const isGeneratingImage = ref(false)
const generatedImage = ref<GeneratedImage | null>(null)
const imageError = ref<string>('')
const imageLoadingText = ref('正在构思画面布局...')
const nutritionLoadingText = ref('营养师正在分析中...')
const wineLoadingText = ref('侍酒师正在推荐中...')
const isFetchingNutrition = ref(false)
const nutritionError = ref('')
const isFetchingWine = ref(false)
const wineError = ref('')
const showImageModal = ref(false)

// 图片生成加载文字轮播
const imageLoadingTexts = [
    '正在构思画面布局...',
    '正在调配色彩搭配...',
    '正在绘制食材细节...',
    '正在优化光影效果...',
    '正在精修画面质感...',
    '正在添加最后润色...',
    '精美效果图即将完成...'
]

// 营养分析加载文字轮播
const nutritionLoadingTexts = [
    '营养师正在分析中...',
    '正在计算卡路里...',
    '正在分析蛋白质含量...',
    '正在评估维生素含量...',
    '正在生成健康建议...',
    '正在准备饮食建议...',
    '营养分析即将完成...'
]

// 饮品搭配加载文字轮播
const wineLoadingTexts = [
    '饮品师正在推荐中...',
    '正在匹配口味特征...',
    '正在考虑饮品平衡...',
    '正在评估搭配效果...',
    '正在选择最佳温度...',
    '正在准备搭配理由...',
    '完美搭配即将呈现...'
]

let imageLoadingInterval: ReturnType<typeof setTimeout> | null = null

const difficultyText = computed(() => {
    const difficultyMap = {
        easy: '简单',
        medium: '中等',
        hard: '困难'
    }
    return difficultyMap[props.recipe.difficulty] || '中等'
})

// 格式化时间显示
const formatTime = (minutes: number): string => {
    if (minutes < 60) {
        return `${minutes}分钟`
    }

    const days = Math.floor(minutes / (24 * 60))
    const hours = Math.floor((minutes % (24 * 60)) / 60)
    const remainingMinutes = minutes % 60

    let result = ''

    if (days > 0) {
        result += `${days}天`
    }

    if (hours > 0) {
        result += `${hours}小时`
    }

    if (remainingMinutes > 0) {
        result += `${remainingMinutes}分钟`
    }

    return result || '0分钟'
}

const toggleExpanded = () => {
    isExpanded.value = !isExpanded.value
}

// 处理收藏状态变化
const onFavoriteChanged = (isFavorited: boolean) => {
    emit('favoriteChanged', isFavorited)
}

const generateImage = async () => {
    if (isGeneratingImage.value) return

    isGeneratingImage.value = true
    imageError.value = ''

    // 开始图片生成加载文字轮播
    let textIndex = 0
    imageLoadingInterval = setInterval(() => {
        imageLoadingText.value = imageLoadingTexts[textIndex]
        textIndex = (textIndex + 1) % imageLoadingTexts.length
    }, 2000)

    try {
        const image = await generateRecipeImage(props.recipe)
        generatedImage.value = image

        // 将生成的图片添加到图库
        const { GalleryService } = await import('@/services/galleryService')
        const prompt = `一道精美的${props.recipe.cuisine.replace('大师', '').replace('菜', '')}菜肴：${props.recipe.name}`
        GalleryService.addToGallery(props.recipe, image.url, image.id, prompt)
    } catch (error) {
        console.error('生成图片失败:', error)
        imageError.value = 'AI画师表示这道菜太有艺术挑战性了，哈哈！'
    } finally {
        isGeneratingImage.value = false
        if (imageLoadingInterval) {
            clearInterval(imageLoadingInterval)
            imageLoadingInterval = null
        }
    }
}

const handleImageError = () => {
    imageError.value = '图片加载失败'
    generatedImage.value = null
}

const fetchNutritionAnalysis = async () => {
    if (isFetchingNutrition.value) return

    isFetchingNutrition.value = true
    nutritionError.value = ''

    let textIndex = 0
    const interval = setInterval(() => {
        nutritionLoadingText.value = nutritionLoadingTexts[textIndex]
        textIndex = (textIndex + 1) % nutritionLoadingTexts.length
    }, 2000)

    try {
        const analysis = await getNutritionAnalysis(props.recipe)
        props.recipe.nutritionAnalysis = analysis
    } catch (error) {
        console.error('获取营养分析失败:', error)
        nutritionError.value = '获取营养分析失败，请稍后重试'
    } finally {
        isFetchingNutrition.value = false
        clearInterval(interval)
    }
}

const fetchWinePairing = async () => {
    if (isFetchingWine.value) return

    isFetchingWine.value = true
    wineError.value = ''

    let textIndex = 0
    const interval = setInterval(() => {
        wineLoadingText.value = wineLoadingTexts[textIndex]
        textIndex = (textIndex + 1) % wineLoadingTexts.length
    }, 2000)

    try {
        const pairing = await getWinePairing(props.recipe)
        props.recipe.winePairing = pairing
    } catch (error) {
        console.error('获取饮品搭配失败:', error)
        wineError.value = '获取饮品搭配失败，请稍后重试'
    } finally {
        isFetchingWine.value = false
        clearInterval(interval)
    }
}

// 打开图片弹窗
const openImageModal = () => {
    if (generatedImage.value) {
        showImageModal.value = true
    }
}

// 关闭图片弹窗
const closeImageModal = () => {
    showImageModal.value = false
}

// 创建适配ImageModal的图片数据
const getModalImageData = (): GalleryImage | null => {
    if (!generatedImage.value) return null

    return {
        id: generatedImage.value.id,
        url: generatedImage.value.url,
        recipeName: props.recipe.name,
        recipeId: props.recipe.id,
        cuisine: props.recipe.cuisine,
        ingredients: props.recipe.ingredients,
        prompt: `一道精美的${props.recipe.cuisine.replace('大师', '').replace('菜', '')}菜肴：${props.recipe.name}`,
        generatedAt: new Date().toISOString()
    }
}

onUnmounted(() => {
    if (imageLoadingInterval) {
        clearInterval(imageLoadingInterval)
    }
})
</script>

<style scoped>
.recipe-card {
    @apply transition-all duration-300 h-full;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
