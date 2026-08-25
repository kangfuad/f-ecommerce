import { ref, computed, onMounted } from 'vue'
import { FaqService, type FaqDto } from '@/infrastructure/services/api/FaqService'

export function useFaq() {
  const faqs = ref<FaqDto[]>([])
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)
  const searchQuery = ref('')
  const selectedCategory = ref<string>('ALL')
  const openFaqIds = ref<string[]>([])

  async function loadFaqs() {
    isLoading.value = true
    errorMessage.value = null
    try {
      const response = await FaqService.getFaqs()
      if (response.status === 'success' && Array.isArray(response.data)) {
        faqs.value = response.data.sort((a, b) => (a.order || 0) - (b.order || 0))
        if (openFaqIds.value.length === 0 && faqs.value.length > 0) {
          openFaqIds.value = faqs.value.slice(0, 3).map((f) => f.id)
        }
      } else {
        errorMessage.value = response.message || 'Gagal memuat data FAQ.'
      }
    } catch (err: any) {
      errorMessage.value = err.message || 'Terjadi kesalahan saat memuat data FAQ.'
    } finally {
      isLoading.value = false
    }
  }

  function toggleFaq(id: string) {
    if (openFaqIds.value.includes(id)) {
      openFaqIds.value = openFaqIds.value.filter((i) => i !== id)
    } else {
      openFaqIds.value.push(id)
    }
  }

  const filteredFaqs = computed(() => {
    return faqs.value.filter((faq) => {
      const matchesCategory = selectedCategory.value === 'ALL' || faq.category === selectedCategory.value
      const query = searchQuery.value.toLowerCase().trim()
      const matchesSearch =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  })

  onMounted(() => {
    loadFaqs()
  })

  return {
    faqs,
    isLoading,
    errorMessage,
    searchQuery,
    selectedCategory,
    openFaqIds,
    loadFaqs,
    toggleFaq,
    filteredFaqs,
  }
}
