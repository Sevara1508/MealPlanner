<template>
  <div class="charts-wrapper">

    <!-- PIE CHART: macro breakdown -->
    <div class="nutrition-box">
      <h3>Macro Breakdown</h3>
      <div v-if="hasMeals">
        <svg ref="pieRef"></svg>
        <div class="legend">
          <span v-for="d in pieData" :key="d.label" class="legend-item">
            <span class="legend-dot" :style="{ background: d.color }"></span>
            {{ d.label }} {{ d.value }}g
          </span>
        </div>
      </div>
      <p v-else class="empty-msg">Drop meals into the calendar to see macros</p>
    </div>

    <!-- BAR CHART: calories per day -->
    <div class="nutrition-box">
      <h3>Calories Per Day</h3>
      <div v-if="hasMeals">
        <svg ref="barRef"></svg>
      </div>
      <p v-else class="empty-msg">Drop meals into the calendar to see calories</p>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  mealPlan: {
    type: Object,
    required: true,
  },
})

const pieRef = ref(null)
const barRef = ref(null)

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const colors = {
  protein: '#5a3434',
  carbs:   '#b97c8a',
  fat:     '#d9b7ac',
}

const hasMeals = computed(() =>
  days.some(d => props.mealPlan[d] && props.mealPlan[d].calories)
)

const pieData = computed(() => {
  let protein = 0, carbs = 0, fat = 0
  days.forEach(d => {
    const meal = props.mealPlan[d]
    if (meal) {
      protein += meal.protein || 0
      carbs   += meal.carbs   || 0
      fat     += meal.fat     || 0
    }
  })
  return [
    { label: 'Protein', value: protein, color: colors.protein },
    { label: 'Carbs',   value: carbs,   color: colors.carbs   },
    { label: 'Fat',     value: fat,     color: colors.fat     },
  ]
})

const barData = computed(() =>
  days.map(d => ({
    day: d,
    calories: props.mealPlan[d]?.calories || 0,
  }))
)

function drawPie() {
  if (!pieRef.value) return

  const size = 160
  const radius = size / 2

  d3.select(pieRef.value).selectAll('*').remove()

  const svg = d3.select(pieRef.value)
    .attr('width', size)
    .attr('height', size)
    .append('g')
    .attr('transform', `translate(${radius},${radius})`)

  const pie = d3.pie().value(d => d.value)(pieData.value)
  const arc = d3.arc().innerRadius(40).outerRadius(radius - 4)

  svg.selectAll('path')
    .data(pie)
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', d => d.data.color)
    .attr('stroke', 'white')
    .attr('stroke-width', 2)
}

function drawBar() {
  if (!barRef.value) return

  const width  = 320
  const height = 160
  const margin = { top: 10, right: 10, bottom: 30, left: 40 }
  const innerW = width  - margin.left - margin.right
  const innerH = height - margin.top  - margin.bottom

  d3.select(barRef.value).selectAll('*').remove()

  const svg = d3.select(barRef.value)
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  const x = d3.scaleBand()
    .domain(days)
    .range([0, innerW])
    .padding(0.3)

  const maxCal = d3.max(barData.value, d => d.calories) || 500

  const y = d3.scaleLinear()
    .domain([0, maxCal * 1.1])
    .range([innerH, 0])

  // x axis
  svg.append('g')
    .attr('transform', `translate(0,${innerH})`)
    .call(d3.axisBottom(x).tickSize(0))
    .select('.domain').remove()

  // y axis
  svg.append('g')
    .call(d3.axisLeft(y).ticks(4).tickFormat(d => `${d}kcal`))
    .select('.domain').remove()

  // bars
  svg.selectAll('rect')
    .data(barData.value)
    .enter()
    .append('rect')
    .attr('x', d => x(d.day))
    .attr('y', d => y(d.calories))
    .attr('width', x.bandwidth())
    .attr('height', d => innerH - y(d.calories))
    .attr('fill', d => d.calories > 0 ? '#5a3434' : '#e8d5cf')
    .attr('rx', 6)
}

function drawCharts() {
  nextTick(() => {
    drawPie()
    drawBar()
  })
}

onMounted(drawCharts)
watch(() => props.mealPlan, drawCharts, { deep: true })
</script>

<style scoped>
.charts-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.nutrition-box {
  background: white;
  border-radius: 18px;
  padding: 1.2rem 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
}

.nutrition-box h3 {
  color: #5a3434;
  font-size: 1rem;
  align-self: flex-start;
}

.empty-msg {
  color: #b97c8a;
  font-size: 0.85rem;
  text-align: center;
  padding: 2rem 1rem;
}

.legend {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
  color: #4d2b2b;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

svg text {
  font-size: 0.75rem;
  fill: #4d2b2b;
}
</style>