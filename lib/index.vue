<template lang="html">
<v-container fluid class="p-1 pt-4">
<property
    v-if="!!resolvedSchema"
    :schema="resolvedSchema"
    :model-root="modelWrapper.root"
    :model-wrapper="modelWrapper"
    :options="fullOptions"
    :store="store"
    :readonly="true"
    model-key="root"
    parent-key=""
    @error="e => $emit('error', e)"
    @change="e => $emit('change', e)"
    @input="e => $emit('input', e)"
  />
  </v-container>
</template>

<script>
import jrefs from './json-refs'
import Property from './Property.vue'
import colors from './colors'
export default {
  name: 'VJsonschemaForm',
  components: {Property},
  props: ['schema', 'options','store', 'model', 'readonly'],
  data() {
    return {modelWrapper: {root: this.model}}
  },
  computed: {
    resolvedSchema() {
      return jrefs.resolve(this.schema)
    },
    fullOptions() {
      const httpLib = this.axios || this.$http || this.$axios
      return Object.assign({}, {
        debug: false,
        httpLib,
        disableAll: false,
        colors,
        autoFoldObjects: false,
        requiredMessage: 'This information is required',
        noDataMessage: 'No matching value found',
        searchMessage: 'Search...'
      }, this.options)
    }
  }
}
</script>
