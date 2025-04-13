<template>
  <div class="quiz-container p-5 bg-white">
    <h3 class="text-primary-dark text-center mt-0 text-2xl">Test Your Knowledge!</h3>
    <div id="quiz-question" class="text-lg mb-5 bg-primary-light text-text-light p-4 rounded-lg text-center">
      {{ currentQuestion.question }}
    </div>
    <div id="quiz-options" class="flex flex-col gap-2.5 mb-5">
      <div 
        v-for="(option, index) in currentQuestion.options" 
        :key="index"
        :class="['quiz-option p-3 px-4 bg-gray-light border-2 border-gray-medium rounded-lg cursor-pointer transition-all',
                { 'selected': selectedIndex === index,
                  'correct': selectedIndex !== null && index === currentQuestion.correctIndex,
                  'incorrect': selectedIndex === index && index !== currentQuestion.correctIndex }]"
        @click="selectOption(index)"
      >
        {{ option }}
      </div>
    </div>
    <div 
      id="quiz-feedback" 
      :class="['text-base mb-5 p-2.5 rounded-lg text-center min-h-[20px]',
              { 'correct bg-green-100 text-green-800': feedbackType === 'correct',
                'incorrect bg-red-100 text-red-800': feedbackType === 'incorrect' }]"
    >
      {{ feedback }}
    </div>
    <button 
      id="next-question" 
      @click="loadRandomQuestion"
      class="primary-button bg-accent text-text-light font-bold p-2.5 px-5 rounded-lg"
    >
      Next Question
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAtomsStore } from '~/stores/atoms'

const store = useAtomsStore()
const currentQuestion = ref({
  question: '',
  options: [],
  correctIndex: 0,
  explanation: ''
})
const selectedIndex = ref(null)
const feedback = ref('')
const feedbackType = ref(null)

// Load a random quiz question
const loadRandomQuestion = () => {
  // Reset state
  selectedIndex.value = null
  feedback.value = ''
  feedbackType.value = null
  
  // Pick a random question
  const randomIndex = Math.floor(Math.random() * store.quizQuestions.length)
  currentQuestion.value = store.quizQuestions[randomIndex]
}

// Handle option selection
const selectOption = (index) => {
  selectedIndex.value = index
  
  // Check if answer is correct
  if (index === currentQuestion.value.correctIndex) {
    feedback.value = `✅ Correct! ${currentQuestion.value.explanation}`
    feedbackType.value = 'correct'
  } else {
    feedback.value = `❌ Not quite. ${currentQuestion.value.explanation}`
    feedbackType.value = 'incorrect'
  }
}

onMounted(() => {
  loadRandomQuestion()
})
</script>

<style scoped>
.quiz-option:hover {
  background-color: var(--gray-medium);
  transform: translateY(-2px);
}

.quiz-option.selected {
  border-color: var(--primary-color);
  background-color: var(--primary-light);
  color: var(--text-light);
}

.quiz-option.correct {
  border-color: #4caf50;
  background-color: rgba(76, 175, 80, 0.2);
}

.quiz-option.incorrect {
  border-color: #f44336;
  background-color: rgba(244, 67, 54, 0.2);
}
</style>
