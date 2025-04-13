<template>
  <div>
    <AppHeader />
    
    <div class="main-container flex flex-col flex-1">
      <AtomControls />
      
      <TabsContainer initial-tab="visualization">
        <TabItem title="Atom View" name="visualization" :active="true">
          <div class="split-view flex h-[70vh] min-h-[450px]">
            <AtomVisualization ref="atomVisualization" />
            <ExplanationPanel />
          </div>
        </TabItem>
        
        <TabItem title="How It Works" name="guide">
          <GuideTab />
        </TabItem>
        
        <TabItem title="Fun Facts" name="learn">
          <LearnTab />
        </TabItem>
        
        <TabItem title="Quiz" name="quiz">
          <QuizTab />
        </TabItem>
      </TabsContainer>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Components
import AppHeader from '~/components/AppHeader.vue'
import AtomControls from '~/components/AtomControls.vue'
import TabsContainer from '~/components/shared/TabsContainer.vue'
import TabItem from '~/components/shared/TabItem.vue'
import AtomVisualization from '~/components/AtomVisualization.vue'
import ExplanationPanel from '~/components/ExplanationPanel.vue'
import GuideTab from '~/components/GuideTab.vue'
import LearnTab from '~/components/LearnTab.vue'
import QuizTab from '~/components/QuizTab.vue'

// Reference to visualization component (for DOM access only)
const atomVisualization = ref(null)
</script>

<style scoped>
.main-container {
  display: flex;
  flex-direction: column;
  flex: 1;
}
</style>
