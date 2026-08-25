<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { IconLocation } from '@/presentation/components/icons'
import SearchableSelect, { type SelectOption } from '@/presentation/components/common/SearchableSelect.vue'
import {
  RegionService,
  toTitleCase,
  type ProvinceDto,
  type RegencyDto,
  type DistrictDto,
  type VillageDto,
} from '@/infrastructure/services/api/RegionService'

const props = withDefaults(
  defineProps<{
    provinceName?: string
    regencyName?: string
    districtName?: string
    villageName?: string
    layout?: 'grid-4' | 'grid-2' | 'stacked'
    required?: boolean
  }>(),
  {
    layout: 'grid-2',
    required: false,
  }
)

const emit = defineEmits<{
  (e: 'update:provinceName', val: string): void
  (e: 'update:regencyName', val: string): void
  (e: 'update:districtName', val: string): void
  (e: 'update:villageName', val: string): void
  (e: 'change', payload: {
    provinceId: string
    provinceName: string
    regencyId: string
    regencyName: string
    districtId: string
    districtName: string
    villageId: string
    villageName: string
    fullRegionText: string
  }): void
}>()

// Raw API Data
const provinces = ref<ProvinceDto[]>([])
const regencies = ref<RegencyDto[]>([])
const districts = ref<DistrictDto[]>([])
const villages = ref<VillageDto[]>([])

// Loading states
const isLoadingProvinces = ref(false)
const isLoadingRegencies = ref(false)
const isLoadingDistricts = ref(false)
const isLoadingVillages = ref(false)

// Selected IDs
const selectedProvinceId = ref('')
const selectedRegencyId = ref('')
const selectedDistrictId = ref('')
const selectedVillageId = ref('')

// Computed Option Lists for SearchableSelect
const provinceOptions = computed<SelectOption[]>(() => {
  return provinces.value.map((p) => ({
    value: p.id,
    label: toTitleCase(p.name),
  }))
})

const regencyOptions = computed<SelectOption[]>(() => {
  return regencies.value.map((r) => ({
    value: r.id,
    label: toTitleCase(r.name),
  }))
})

const districtOptions = computed<SelectOption[]>(() => {
  return districts.value.map((d) => ({
    value: d.id,
    label: toTitleCase(d.name),
  }))
})

const villageOptions = computed<SelectOption[]>(() => {
  return villages.value.map((v) => ({
    value: v.id,
    label: toTitleCase(v.name),
  }))
})

// Current display names
const currentProvince = computed(() => provinces.value.find((p) => p.id === selectedProvinceId.value))
const currentRegency = computed(() => regencies.value.find((r) => r.id === selectedRegencyId.value))
const currentDistrict = computed(() => districts.value.find((d) => d.id === selectedDistrictId.value))
const currentVillage = computed(() => villages.value.find((v) => v.id === selectedVillageId.value))

// Emit full change payload
function emitFullChange() {
  const pName = currentProvince.value ? toTitleCase(currentProvince.value.name) : ''
  const rName = currentRegency.value ? toTitleCase(currentRegency.value.name) : ''
  const dName = currentDistrict.value ? toTitleCase(currentDistrict.value.name) : ''
  const vName = currentVillage.value ? toTitleCase(currentVillage.value.name) : ''

  emit('update:provinceName', pName)
  emit('update:regencyName', rName)
  emit('update:districtName', dName)
  emit('update:villageName', vName)

  const parts = [
    vName ? `Kel. ${vName}` : '',
    dName ? `Kec. ${dName}` : '',
    rName,
    pName,
  ].filter(Boolean)

  emit('change', {
    provinceId: selectedProvinceId.value,
    provinceName: pName,
    regencyId: selectedRegencyId.value,
    regencyName: rName,
    districtId: selectedDistrictId.value,
    districtName: dName,
    villageId: selectedVillageId.value,
    villageName: vName,
    fullRegionText: parts.join(', '),
  })
}

// Handlers for selection
async function onProvinceChange(newProvinceId: string) {
  selectedProvinceId.value = newProvinceId
  selectedRegencyId.value = ''
  selectedDistrictId.value = ''
  selectedVillageId.value = ''
  regencies.value = []
  districts.value = []
  villages.value = []

  emitFullChange()

  if (newProvinceId) {
    isLoadingRegencies.value = true
    try {
      const res = await RegionService.getRegencies(newProvinceId)
      if (res.status === 'success' && res.data) {
        regencies.value = res.data
      }
    } finally {
      isLoadingRegencies.value = false
    }
  }
}

async function onRegencyChange(newRegencyId: string) {
  selectedRegencyId.value = newRegencyId
  selectedDistrictId.value = ''
  selectedVillageId.value = ''
  districts.value = []
  villages.value = []

  emitFullChange()

  if (newRegencyId) {
    isLoadingDistricts.value = true
    try {
      const res = await RegionService.getDistricts(newRegencyId)
      if (res.status === 'success' && res.data) {
        districts.value = res.data
      }
    } finally {
      isLoadingDistricts.value = false
    }
  }
}

async function onDistrictChange(newDistrictId: string) {
  selectedDistrictId.value = newDistrictId
  selectedVillageId.value = ''
  villages.value = []

  emitFullChange()

  if (newDistrictId) {
    isLoadingVillages.value = true
    try {
      const res = await RegionService.getVillages(newDistrictId)
      if (res.status === 'success' && res.data) {
        villages.value = res.data
      }
    } finally {
      isLoadingVillages.value = false
    }
  }
}

function onVillageChange(newVillageId: string) {
  selectedVillageId.value = newVillageId
  emitFullChange()
}

// Initial load
async function loadProvinces() {
  isLoadingProvinces.value = true
  try {
    const res = await RegionService.getProvinces()
    if (res.status === 'success' && res.data) {
      provinces.value = res.data
      
      // Auto-match initial values if provided
      if (props.provinceName) {
        const found = provinces.value.find(
          (p) => p.name.toLowerCase() === props.provinceName?.toLowerCase() || p.id === props.provinceName
        )
        if (found) {
          await onProvinceChange(found.id)
        }
      }
    }
  } finally {
    isLoadingProvinces.value = false
  }
}

onMounted(() => {
  loadProvinces()
})
</script>

<template>
  <div class="space-y-3.5">
    <div
      :class="[
        layout === 'grid-4' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3' :
        layout === 'grid-2' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3.5' :
        'space-y-3'
      ]"
    >
      <!-- 1. Provinsi -->
      <div>
        <SearchableSelect
          :model-value="selectedProvinceId"
          @update:model-value="onProvinceChange"
          label="1. Provinsi"
          placeholder="Pilih Provinsi..."
          search-placeholder="Ketik nama provinsi (misal: DKI Jakarta, Jawa Barat)..."
          :options="provinceOptions"
          :required="required"
          :disabled="isLoadingProvinces"
        />
      </div>

      <!-- 2. Kota / Kabupaten -->
      <div>
        <SearchableSelect
          :model-value="selectedRegencyId"
          @update:model-value="onRegencyChange"
          label="2. Kota / Kabupaten"
          :placeholder="selectedProvinceId ? 'Pilih Kota / Kabupaten...' : 'Pilih Provinsi Dahulu'"
          search-placeholder="Ketik nama kota/kabupaten..."
          :options="regencyOptions"
          :required="required"
          :disabled="!selectedProvinceId || isLoadingRegencies"
        />
      </div>

      <!-- 3. Kecamatan -->
      <div>
        <SearchableSelect
          :model-value="selectedDistrictId"
          @update:model-value="onDistrictChange"
          label="3. Kecamatan"
          :placeholder="selectedRegencyId ? 'Pilih Kecamatan...' : 'Pilih Kota Dahulu'"
          search-placeholder="Ketik nama kecamatan..."
          :options="districtOptions"
          :required="required"
          :disabled="!selectedRegencyId || isLoadingDistricts"
        />
      </div>

      <!-- 4. Kelurahan / Desa -->
      <div>
        <SearchableSelect
          :model-value="selectedVillageId"
          @update:model-value="onVillageChange"
          label="4. Kelurahan / Desa"
          :placeholder="selectedDistrictId ? 'Pilih Kelurahan / Desa...' : 'Pilih Kecamatan Dahulu'"
          search-placeholder="Ketik nama kelurahan/desa..."
          :options="villageOptions"
          :required="required"
          :disabled="!selectedDistrictId || isLoadingVillages"
        />
      </div>
    </div>

    <!-- Active Region Breadcrumb / Summary -->
    <div
      v-if="selectedProvinceId"
      class="p-3 rounded-xl bg-forest/5 dark:bg-forest/10 border border-forest/20 text-xs flex items-center gap-2 text-theme-primary flex-wrap animate-fade-up"
    >
      <div class="flex items-center gap-1.5 font-bold text-forest dark:text-forest-glow shrink-0">
        <IconLocation :size="14" />
        <span>Wilayah Terpilih:</span>
      </div>
      <span v-if="currentVillage" class="font-semibold">Kel. {{ toTitleCase(currentVillage.name) }},</span>
      <span v-if="currentDistrict" class="font-semibold">Kec. {{ toTitleCase(currentDistrict.name) }},</span>
      <span v-if="currentRegency" class="font-semibold">{{ toTitleCase(currentRegency.name) }},</span>
      <span v-if="currentProvince" class="font-bold text-forest dark:text-forest-glow">{{ toTitleCase(currentProvince.name) }}</span>
    </div>
  </div>
</template>
