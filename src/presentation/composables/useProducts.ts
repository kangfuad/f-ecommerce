import { shallowRef, ref, computed, inject } from 'vue'
import { Product } from '@/domain/entities/Product'
import { ProductCategory } from '@/domain/enums/ProductCategory'
import { TOKENS } from '@/infrastructure/di/tokens'
import { DIContainer } from '@/infrastructure/di/container'
import type { ProductFilterParams } from '@/application/contracts/IProductRepository'

// Global shared state across Header, Home, and Catalog views
const products = shallowRef<Product[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

const selectedCategory = ref<ProductCategory>(ProductCategory.ALL)
const searchQuery = ref('')
const sortBy = ref<'popular' | 'price_asc' | 'price_desc' | 'rating'>('popular')

export function useProducts() {
  const getProductsUseCase = inject(TOKENS.GET_PRODUCTS_USE_CASE, DIContainer.getProductsUseCase)

  const featuredProducts = computed(() => products.value.filter((p) => p.isFeatured))
  const popularProducts = computed(() => products.value.filter((p) => p.isPopular))

  async function fetchProducts() {
    isLoading.value = true
    errorMessage.value = null
    try {
      const filter: ProductFilterParams = {
        category: selectedCategory.value,
        searchQuery: searchQuery.value,
        sortBy: sortBy.value,
      }
      products.value = await getProductsUseCase.execute(filter)
    } catch (err: any) {
      errorMessage.value = err.message || 'Gagal memuat daftar barang sewa'
    } finally {
      isLoading.value = false
    }
  }

  function setCategory(category: ProductCategory) {
    selectedCategory.value = category
    fetchProducts()
  }

  function setSearch(query: string) {
    searchQuery.value = query
    fetchProducts()
  }

  function setSort(sort: 'popular' | 'price_asc' | 'price_desc' | 'rating') {
    sortBy.value = sort
    fetchProducts()
  }

  return {
    products,
    isLoading,
    errorMessage,
    selectedCategory,
    searchQuery,
    sortBy,
    featuredProducts,
    popularProducts,
    fetchProducts,
    setCategory,
    setSearch,
    setSort,
  }
}
