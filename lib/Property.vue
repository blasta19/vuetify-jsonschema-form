<template>
  <!-- Hide const ? Or make a readonly field -->

  <v-flex v-if="fullSchema && fullSchema.const === undefined && fullSchema['x-display'] !== 'hidden'"  :class="fullSchema['x-grid'] ? fullSchema['x-grid'] : 'xs12'">
    <!-- Date picker -->
    <v-menu v-if="fullSchema.type === 'string' && ['date', 'date-time'].includes(fullSchema.format)" ref="menu" :close-on-content-click="false" v-model="menu"
            :nudge-right="40"
            :disabled="disabled"
            lazy
            transition="scale-transition"
            offset-y
            full-width
            min-width="290px">
            <template v-slot:activator="{ on }">
      <v-text-field
        slot="activator"
        maxlength="10"
        v-model="dateFormatted"
        :value="parseDate(dateFormatted)"
        :label="label"
        :name="fullKey"
        :required="required"
        :rules="rules"
        :clearable="!required"
        prepend-inner-icon="event"
        @keyup.enter="modelWrapper[modelKey] = parseDate(dateFormatted)"
        @blur="modelWrapper[modelKey] = parseDate(dateFormatted)"
        v-on="on"
        outline>

        <v-tooltip v-if="fullSchema['icon']" slot="prepend-inner" left>
          <v-icon slot="activator">{{fullSchema['icon'] !== '' ? fullSchema['icon']  : 'info'}}</v-icon>
          <div class="vjsf-tooltip" v-html="htmlDescription" />
        </v-tooltip>
      </v-text-field>
            </template>
      <v-date-picker v-model="modelWrapper[modelKey]" @input="menu = false" no-title scrollable>
      </v-date-picker>
    </v-menu>
  <div v-else-if="fullSchema.type === 'string' && ['date', 'date-time'].includes(fullSchema.format)">
    <v-subheader class="px-0">
      {{label}}
    </v-subheader>
    {{modelWrapper[modelKey]}}
  </div>
    <!-- Color picking -->
    <v-input v-else-if="fullSchema.format === 'hexcolor'"
             :name="fullKey"
             :label="label"
             :required="required"
             :rules="rules"
             :disabled="disabled">
      <v-tooltip v-if="fullSchema['icon']" slot="append" left>
        <v-icon slot="activator">{{fullSchema['icon'] !== '' ? fullSchema['icon']  : 'info'}}</v-icon>
        <div class="vjsf-tooltip" v-html="htmlDescription" />
      </v-tooltip>
      &nbsp;&nbsp;
      <swatches
        v-model="modelWrapper[modelKey]"
        :disabled="disabled"
        :colors="options.colors"
        :trigger-style="{width:'36px', height:'36px'}"
        shapes="circles"
        @input="input();change();"/>
    </v-input>

    <!-- Select field based on an enum (array or simple value) -->
    <template v-else-if="(fullSchema.type === 'array' && fullSchema.items.enum) || fullSchema.enum">
      <!--{{ selectItems }}<br>
      {{ modelWrapper[modelKey] }}-->
      <v-select
        :items="selectItems"
        v-model="modelWrapper[modelKey]"
        :name="fullKey"
        :label="label"
        :required="required"
        :rules="rules"
        :disabled="disabled"
        :clearable="!required"
        :readonly="fullSchema.readonly"
        :multiple="fullSchema.type === 'array'"
        outline>
        <v-tooltip v-if="fullSchema['icon']" slot="prepend-inner" left>
          <v-icon slot="activator">{{fullSchema['icon'] !== '' ? fullSchema['icon']  : 'info'}}</v-icon>
          <div class="vjsf-tooltip" v-html="htmlDescription" />
        </v-tooltip>
      </v-select>
    </template>

    <!-- Select field based on a oneOf on a simple type (array or simple value) -->
    <!-- cf https://github.com/mozilla-services/react-jsonfullSchema-form/issues/532 -->
    <v-select v-else-if="oneOfSelect"
              :items="selectItems"
              v-model="modelWrapper[modelKey]"
              :name="fullKey"
              :label="label"
              :required="required"
              :disabled="disabled"
              :rules="rules"
              :clearable="!required"
              :multiple="fullSchema.type === 'array'"
              :item-text="itemTitle"
              :item-value="itemKey"
              :readonly="fullSchema.readonly"
              @change="change"
              @input="input"
              outline>
      <v-tooltip v-if="fullSchema['icon']" slot="prepend-inner" left>
        <v-icon slot="activator">{{fullSchema['icon'] !== '' ? fullSchema['icon']  : 'info'}}</v-icon>
        <div class="vjsf-tooltip" v-html="htmlDescription" />
      </v-tooltip>
    </v-select>

    <!-- Select field on an ajax response or from an array in another part of the data -->
    <v-select v-else-if="(fromUrl || fullSchema['x-fromData'] || fullSchema['x-getData']) && fullSchema['x-arrayType'] !== 'custom'"
              :items="selectItems"
              v-model="modelWrapper[modelKey]"
              :name="fullKey"
              :label="label"
              :disabled="disabled"
              :required="required"
              :rules="rules"
              :item-text="itemTitle"
              :item-value="itemKey"
              :return-object="(fullSchema.type === 'array' && fullSchema.items.type === 'object') || fullSchema.type === 'object' || fullSchema['x-type'] === 'object'"
              :clearable="!required"
              :loading="loading"
              :multiple="fullSchema.type === 'array'"
              :readonly="fullSchema.readonly"
                  outline
              @input="input"
              >
      <v-tooltip v-if="fullSchema['icon']" slot="prepend-inner" left>
        <v-icon slot="activator">{{fullSchema['icon'] !== '' ? fullSchema['icon']  : 'info'}}</v-icon>
        <div class="vjsf-tooltip" v-html="htmlDescription" />
      </v-tooltip>
      <template v-if="fullSchema.type === 'array'" v-slot:selection="{item, index}" >
        <span v-if="index === 0" style="max-width:150px" class="mt-3">{{ item.name }}</span>
        <span v-if="index === 1" class="grey--text caption mt-3">&nbsp;+{{ (modelWrapper[modelKey].length - 1) }}</span>
      </template>
    </v-select>
    <!-- auto-complete field on an ajax response with query -->

    <v-combobox v-else-if="fromUrlWithQuery"
                    :items="selectItems"
                    :search-input.sync="q"
                    v-model="modelWrapper[modelKey]"
                    :name="fullKey"
                    :label="label"
                    :no-data-text="options.noDataMessage"
                    :disabled="disabled"
                    :required="required"
                    :rules="rules"
                    :item-text="itemTitle"
                    :item-value="itemKey"
                    :return-object="(fullSchema.type === 'array' && fullSchema.items.type === 'object') || fullSchema.type === 'object' || fullSchema['x-type'] === 'object'"
                    :clearable="!required"
                    :filter="() => true"
                    :placeholder="options.searchMessage"
                    :readonly="fullSchema.readonly"
                    :loading="loading"
                    :multiple="fullSchema.type === 'array'"
                    @keyup="modelWrapper[modelKey] = q.length === 0 ? null : modelWrapper[modelKey]"
                    hide-selected
                    outline>
      <template v-slot:no-data>
        <v-list-tile v-if="fullSchema['create_new'] && q && selectItems.length == 0 && !loading && (/\s\w{3,}/.test(q) || (fullSchema['one_word'] && q.length > 3))">
          <v-chip
            label
            small
            text-color="white"
            color="green"
            @click = "createNew((fullSchema['no-data-form'] ? fullSchema['no-data-form'] : false), fullSchema['no-data-value'])"
          >
           Create New {{q}}
          </v-chip>
        </v-list-tile>
      </template>
      <template v-slot:append-item>
        <v-list-tile v-if="fullSchema['create_new'] && selectItems !== null && selectItems.length > 0 && q && !loading && (/\s\w{3,}/.test(q) || (fullSchema['one_word'] && q.length > 3))">
          <v-chip
            label
            small
            text-color="white"
            color="green"
            @click = "createNew((fullSchema['no-data-form'] ? fullSchema['no-data-form'] : false), fullSchema['no-data-value'])"
          >
           Create New {{q}}
          </v-chip>
        </v-list-tile>
      </template>
      <v-tooltip v-if="fullSchema.description" slot="prepend-inner" left>
        <v-icon slot="activator">{{fullSchema['icon'] !== '' ? fullSchema['icon']  : 'info'}}</v-icon>
        <div class="vjsf-tooltip" v-html="htmlDescription" />
      </v-tooltip>
    </v-combobox>

    <!-- Long text field in a textarea -->
    <v-textarea v-else-if="fullSchema.type === 'string' && (fullSchema.maxLength && fullSchema.maxLength > 1000 && fullSchema['x-display'] !== 'single-line')"
                v-model="modelWrapper[modelKey]"
                :name="fullKey"
                :label="label"
                :disabled="disabled"
                :required="required"
                :rules="rules"
                box
                @change="change"
                @input="input"
                outline>
      <v-tooltip v-if="fullSchema['icon']" slot="prepend-inner" left>
        <v-icon slot="activator">{{fullSchema['icon'] !== '' ? fullSchema['icon']  : 'info'}}</v-icon>
        <div class="vjsf-tooltip" v-html="htmlDescription" />
      </v-tooltip>
    </v-textarea>

    <div v-else-if="fullSchema.type === 'component'" id="container"></div>
    <!-- text field displayed as password -->
    <v-text-field v-else-if="fullSchema.type === 'string' && fullSchema['x-display'] === 'password'"
                  v-model="modelWrapper[modelKey]"
                  :name="fullKey"
                  :label="label"
                  :disabled="disabled"
                  :required="required"
                  :rules="rules"
                  type="password"
                  :readonly="fullSchema.readonly"
                  @change="change"
                  @input="input"
                  outline>
      <v-tooltip v-if="fullSchema['icon']" slot="prepend-inner" left>
        <v-icon slot="activator">{{fullSchema['icon'] !== '' ? fullSchema['icon']  : 'info'}}</v-icon>
        <div class="vjsf-tooltip" v-html="htmlDescription" />
      </v-tooltip>
    </v-text-field>

    <!-- Simple text field -->

    <v-text-field v-else-if="fullSchema.type === 'string'"
                  v-model="modelWrapper[modelKey]"
                  :name="fullKey"
                  :label="label"
                  :disabled="disabled"
                  :required="required"
                  :rules="rules"
                  :readonly="fullSchema.readonly"
                  @change="change"
                  @input="input"
                  height="10"
                  outline>{{"text" + modelWrapper[modelKey]}}
      <v-tooltip v-if="fullSchema['icon']" slot="prepend-inner" left>
        <v-icon slot="activator">{{fullSchema['icon'] !== '' ? fullSchema['icon']  : 'info'}}</v-icon>
        <div class="vjsf-tooltip" v-html="htmlDescription" />
      </v-tooltip>
    </v-text-field>
    <!-- Simple number fields -->
    <v-text-field v-else-if="(fullSchema.type === 'number' || fullSchema.type === 'integer')"
                  v-model.number="modelWrapper[modelKey]"
                  :name="fullKey"
                  :label="label"
                  :min="fullSchema.minimum"
                  :max="fullSchema.maximum"
                  :step="fullSchema.type === 'integer' && fullSchema.step ? apptInterval : 1"
                  :disabled="disabled"
                  :readonly="fullSchema.readonly"
                  :required="required"
                  :rules="rules"
                  type="number"
                  @change="change"
                  @input="input"
                  outline>
      <v-tooltip v-if="fullSchema['icon']" slot="prepend-inner" left>
        <v-icon slot="activator">{{fullSchema['icon'] !== '' ? fullSchema['icon']  : 'info'}}</v-icon>
        <div class="vjsf-tooltip" v-html="htmlDescription" />
      </v-tooltip>
    </v-text-field>
    <v-text-field v-else-if="(fullSchema.type === 'string' && fullSchema.format === 'email')"
                  v-model.number="modelWrapper[modelKey]"
                  :name="fullKey"
                  :label="label"
                  :disabled="disabled"
                  :required="required"
                  :readonly="fullSchema.readonly"
                  :rules="rules"
                  type="string"
                  @change="change"
                  @input="input"
                  outline>
      <v-tooltip v-if="fullSchema['icon']" slot="prepend-inner" left>
        <v-icon slot="activator">{{fullSchema['icon'] !== '' ? fullSchema['icon']  : 'info'}}</v-icon>
        <div class="vjsf-tooltip" v-html="htmlDescription" />
      </v-tooltip>
    </v-text-field>
    <!-- Simple boolean field -->
    <v-checkbox v-else-if="fullSchema.type === 'boolean'"
                v-model="modelWrapper[modelKey]"
                :label="label"
                :name="fullKey"
                :disabled="disabled"
                :required="required"
                :rules="rules"
                @change="change"
                @input="input">
      <v-tooltip v-if="fullSchema['icon']" slot="append" left>
        <v-icon slot="activator">{{fullSchema['icon'] !== '' ? fullSchema['icon']  : 'info'}}</v-icon>
        <div class="vjsf-tooltip" v-html="htmlDescription" />
      </v-tooltip>
    </v-checkbox>

    <!-- Simple strings array -->
    <v-combobox
      v-else-if="fullSchema.type === 'array' && fullSchema.items.type === 'string'"
      v-model="modelWrapper[modelKey]"
      :name="fullKey"
      :label="label"
      :required="required"
      :rules="rules"
      :disabled="disabled"
      chips
      :readonly="fullSchema.readonly"
      multiple
      append-icon=""
      @change="change"
      @input="input">
      <v-tooltip v-if="fullSchema['icon']" slot="prepend-inner" left>
        <v-icon slot="activator">{{fullSchema['icon'] !== '' ? fullSchema['icon']  : 'info'}}</v-icon>
        <div class="vjsf-tooltip" v-html="htmlDescription" />
      </v-tooltip>
      <template slot="selection" slot-scope="data">
        <v-chip
          :selected="data.selected"
          close
          @input="modelWrapper[modelKey].splice(modelWrapper[modelKey].indexOf(data.item)); change(); input()"
        >
          {{ data.item }}
        </v-chip>
      </template>
    </v-combobox>

    <!-- Object sub container with properties that may include a select based on a oneOf and subparts base on a allOf -->
    <div v-else-if="fullSchema.type === 'object'">
      <v-subheader v-if="fullSchema.title" :style="foldable ? 'cursor:pointer;' :'' " class="mt-1 mb-2 pl-0" @click="folded = !folded">
        {{ fullSchema.title }}
        &nbsp;
        <v-icon v-if="foldable && folded">arrow_drop_down</v-icon>
        <v-icon v-if="foldable && !folded">arrow_drop_up</v-icon>
  <v-tooltip v-if="fullSchema.description" left>
        <v-icon slot="activator">
          info
        </v-icon>
        <div class="vjsf-tooltip" v-html="htmlDescription" />
      </v-tooltip>
      </v-subheader>

      <v-slide-y-transition>

        <v-layout row wrap v-show="!foldable || !folded">
          <!-- <p v-if="fullSchema.description">{{ fullSchema.description }}</p> -->
          <property v-for="childProp in fullSchema.properties" :key="childProp.key"
                    :schema="childProp"
                    :model-wrapper="modelWrapper[modelKey]"
                    :model-root="modelRoot"
                    :model-key="childProp.key"
                    :parent-key="fullKey + '.'"
                    :required="!!(fullSchema.required && fullSchema.required.includes(childProp.key))"
                    :options="options"
                    :apptInterval="apptInterval"
                    @error="e => $emit('error', e)"
                    @change="e => $emit('change', e)"
                    @input="e => $emit('input', e)"
                    @createNew="e => $emit('createNew', e)" />

          <!-- Sub containers for allOfs -->
          <template v-if="fullSchema.allOf && fullSchema.allOf.length">
            <template v-if="!parentKey && fullSchema.allOf[0].title">
              <!-- Accordion / expansion panets at root level -->
              <v-expansion-panel :inset="options.accordionMode === 'inset'" :popout="options.accordionMode === 'popout'" focusable>
                <v-expansion-panel-content v-for="(currentAllOf, i) in fullSchema.allOf" :key="i">
                  <span slot="header" style="font-weight:bold">{{ currentAllOf.title }}</span>
                  <v-card>
                    <v-card-text >
                      <property
                        :schema="Object.assign({}, currentAllOf, {type: 'object', title: null})"
                        :model-wrapper="subModels"
                        :model-root="modelRoot"
                        :model-key="'allOf-' + i"
                        :parent-key="parentKey"
                        :options="options"
                        :apptInterval="apptInterval"
                        @error="e => $emit('error', e)"
                        @change="e => $emit('change', e)"
                        @input="e => $emit('input', e)"
                        @createNew="e => $emit('createNew', e)" />
                    </v-card-text>
                  </v-card>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </template>
            <template v-else>
              <!-- simple objects if we are at first level -->
              <property
                v-for="(currentAllOf, i) in (fullSchema.allOf || [])" :key="i"
                :schema="Object.assign({}, currentAllOf, {type: 'object'})"
                :model-wrapper="subModels"
                :model-root="modelRoot"
                :model-key="'allOf-' + i"
                :parent-key="parentKey"
                :options="options"
                :apptInterval="apptInterval"
                @error="e => $emit('error', e)"
                @change="e => $emit('change', e)"
                @input="e => $emit('input', e)"
                @createNew="e => $emit('createNew', e)" />
            </template>
          </template>

          <!-- Sub container with a select for oneOfs -->
          <v-select
            v-if="fullSchema.oneOf"
            :items="fullSchema.oneOf"
            v-model="currentOneOf"
            :disabled="disabled"
            :item-value="item => {return oneOfConstProp ? item.properties[oneOfConstProp.key].const : item.title}"
            :label="oneOfConstProp ? (oneOfConstProp.title || oneOfConstProp.key) : 'Type'"
            :required="oneOfRequired"
            :clearable="!oneOfRequired"
            :readonly="fullSchema.readonly"
            :rules="oneOfRules"
            item-text="title"
            return-object
            outline >
            <v-tooltip v-if="oneOfConstProp && oneOfConstProp.description" slot="prepend-inner" left>
              <v-icon slot="activator">{{fullSchema['icon'] !== '' ? fullSchema['icon']  : 'info'}}</v-icon>
              <div class="vjsf-tooltip" v-html="oneOfConstProp.htmlDescription"/>
            </v-tooltip>
          </v-select>
          <!--{{ currentOneOf }}-->
          <template v-if="currentOneOf">
            <property
              :schema="Object.assign({}, currentOneOf, {title: null, type: 'object'})"
              :model-wrapper="subModels"
              :model-root="modelRoot"
              :parent-key="parentKey"
              :options="options"
              :apptInterval="apptInterval"
              model-key="currentOneOf"
              @error="e => $emit('error', e)"
              @change="e => $emit('change', e)"
              @input="e => $emit('input', e)"
              @createNew="e => $emit('createNew', e)"
            />
          </template>
        </v-layout>
      </v-slide-y-transition>
    </div>

    <!-- Tuples array sub container -->
    <div v-else-if="fullSchema.type === 'array' && Array.isArray(fullSchema.items)">
      <v-subheader v-if="fullSchema.title" :style="foldable ? 'cursor:pointer;' :'' " class="mt-1 mb-2 pl-0" @click="folded = !folded">
        {{ fullSchema.title }}
        <v-icon v-if="foldable && folded">arrow_drop_down</v-icon>
        <v-icon v-if="foldable && !folded">arrow_drop_up</v-icon>
        <v-tooltip v-if="fullSchema.description" left>
        <v-icon slot="activator">
          info
        </v-icon>
        <div class="vjsf-tooltip" v-html="htmlDescription" />
      </v-tooltip>
      </v-subheader>
      <v-slide-y-transition>
        <div v-show="!foldable || !folded">
          <p v-if="fullSchema.description">{{ fullSchema.description }}</p>
          <property v-for="(child, i) in fullSchema.items" :key="i"
                    :schema="child"
                    :model-wrapper="modelWrapper[modelKey]"
                    :model-root="modelRoot"
                    :model-key="i"
                    :parent-key="fullKey + '.'"
                    :options="options"
                    :apptInterval="apptInterval"
                    @error="e => $emit('error', e)"
                    @change="e => $emit('change', e)"
                    @input="e => $emit('input', e)"
                    @createNew="e => $emit('createNew', e)" />
        </div>
      </v-slide-y-transition>
    </div>
  <div v-else-if="(fullSchema['x-arrayType'] === 'custom') && (fromUrl || fullSchema['x-fromData'] || fullSchema['x-getData'])">
    <v-layout row wrap class="mb-1 pl-1">
      <v-menu v-if="modelWrapper[modelKey].length === 0" v-model="menu2" :retun-value.sync="menu2">
        <template v-slot:activator="{ on }">
        <v-btn color="buttoncolor" class="px-4" depressed v-on="on">
          {{fullSchema['label']}} <v-icon v-if="(!fullSchema['label'] && !fullSchema['icon']) || fullSchema['icon']"> {{fullSchema['icon'] ? fullSchema['icon'] : 'add'}}</v-icon>
        </v-btn>
        </template>
        <v-list>
          <v-list-tile  v-for="(item, i) in customItems" :key="i" @click="saveItem(modelWrapper[modelKey], item);">
            <v-list-tile-title>{{ item[fullSchema['x-itemTitle']] }}</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>

    </v-layout>

      <v-container v-if="modelWrapper[modelKey] && modelWrapper[modelKey].length" fluid pa-0>
        <v-layout row wrap grid-list-md >
          <draggable v-model="modelWrapper[modelKey]" :options="{handle:'.handle'}" style="width: 100%;">

            <v-flex v-for="(itemModel, i) in sortedData" :key="i">
                <v-layout row wrap>
                  <v-flex xs10>
                    <v-subheader class="px-0 mb-2">{{itemModel.title}}</v-subheader>
                    <v-card flat color="transparent" class="array-card">
                      <v-layout row wrap>

                        <property v-for="(child, index) in sortedData[i].fields.properties" :key="index"
                            :schema="child"
                            :model-wrapper="sortedData[i]"
                            :model-root="sortedData"
                            :model-key="index"
                            :parent-key="fullKey + '.'"
                            :required="child['required']"
                            :options="options"
                            :apptInterval="apptInterval"
                            @error="e => $emit('error', e)"
                            @change="e => $emit('change', e)"
                            @input="e => $emit('input', e)"
                            @createNew="e => $emit('createNew', e)" />
                      </v-layout>
                    </v-card>
                  </v-flex>
                  <v-flex xs2>
                    <v-layout align-center row fill-height class="p-">
                      <v-btn class="ma-1" fab icon dark small color="#D96252" @click="deleteItem(i); change(); input()">
                      <v-icon dark>remove</v-icon>
                    </v-btn>
                    <v-menu v-if="(!fullSchema['uniqueness'] || (modelWrapper[modelKey].length - 1) !== (customItems.length - 1)) && (i+1) === modelWrapper[modelKey].length">
                      <template v-slot:activator="{ on }">
                        <v-btn class="ma-1" fab small icon color="#66639B" v-on="on">
                          <v-icon color="white">add</v-icon>
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-tile v-for="(item, i) in customItems" :key="i" @click="saveItem(modelWrapper[modelKey],item); change(); input()">
                          <v-list-tile-title>{{ item[fullSchema['x-itemTitle']] }}</v-list-tile-title>
                        </v-list-tile>
                      </v-list>
                    </v-menu>
                    </v-layout>
                  </v-flex>
                </v-layout>
            </v-flex>
          </draggable>
        </v-layout>
      </v-container>


    </div>
    <!-- Dynamic size array of complex types sub container -->
    <div v-else-if="fullSchema.type === 'array'">
      <v-layout row class="mt-2 mb-1 pr-1">
        <v-btn v-if="modelWrapper[modelKey].length === 0" fab small icon color="#66639B" @click="modelWrapper[modelKey].push(fullSchema.items.default || defaultValue(fullSchema.items)); change(); input()">
          <v-icon color="white">add</v-icon>
        </v-btn>
        <v-spacer/>
        <v-tooltip v-if="fullSchema['icon']" left>
          <v-icon slot="activator">{{fullSchema['icon'] !== '' ? fullSchema['icon']  : 'info'}}</v-icon>
          <div class="vjsf-tooltip" v-html="htmlDescription"/>
        </v-tooltip>
      </v-layout>

      <v-container v-if="modelWrapper[modelKey] && modelWrapper[modelKey].length" grid-list-md class="pt-0 px-2">
        <v-layout row wrap>
          <draggable v-model="modelWrapper[modelKey]" :options="{handle:'.handle'}" style="width: 100%;">
            <v-flex v-for="(itemModel, i) in modelWrapper[modelKey]" :key="i">

                <v-layout row wrap>
                  <v-flex xs11>
                    <v-card class="array-card mb-3">
                    <property :schema="fullSchema.items"
                            :model-wrapper="modelWrapper[modelKey]"
                            :model-root="modelRoot"
                            :model-key="i"
                            :parent-key="`${fullKey}.`"
                            :options="options"
                            :apptInterval="apptInterval"
                            @error="e => $emit('error', e)"
                            @change="e => $emit('change', e)"
                            @input="e => $emit('input', e)"
                            @createNew="e => $emit('createNew', e)" />
                             </v-card>
                  </v-flex>
                  <v-flex xs1>
                    <v-btn fab icon dark small color="#D96252" @click="modelWrapper[modelKey].splice(i, 1); change(); input()">
                      <v-icon dark>remove</v-icon>
                    </v-btn>
                    <v-btn v-if="(i+1) === modelWrapper[modelKey].length" fab small icon color="#66639B" @click="modelWrapper[modelKey].push(fullSchema.items.default || defaultValue(fullSchema.items)); change(); input()">
                      <v-icon color="white">add</v-icon>
                    </v-btn>
                  </v-flex>
                </v-layout>
            </v-flex>
          </draggable>
        </v-layout>
      </v-container>
    </div>
    <p v-else-if="options.debug">Unsupported type "{{ fullSchema.type }}" - {{ fullSchema }}</p>
  </v-flex>
</template>

<script>
const matchAll = require('match-all')
const md = require('markdown-it')()
import _ from 'lodash'
export default {
  name: 'Property',
  props: ['schema', 'modelWrapper', 'modelRoot', 'modelKey', 'parentKey', 'required', 'options', 'apptInterval'],
  data() {
    return {
      ready: false,
      menu: false,
      rawSelectItems: null,
      selectItems: null,
      q: '',
      currentOneOf: null,
      fromUrlParams: {},
      loading: false,
      folded: true,
      menu2: null,
      customSchemaItems: null,
      customItems: null,
      subModels: {}, // a container for objects from root oneOfs and allOfs,
      dateFormatted: null
    }
  },

  computed: {
    fullSchema() {
      // console.log('Re process full schema')
      const fullSchema = JSON.parse(JSON.stringify(this.schema))

      if (fullSchema.type !== 'object') return fullSchema

      // Properties as array, because order matters
      fullSchema.properties = JSON.parse(JSON.stringify(this.objectToArray(fullSchema.properties)))
      fullSchema.required = fullSchema.required || []
      fullSchema.dependencies = fullSchema.dependencies || {}

      // Extend schema based on satisfied dependencies
      if (fullSchema.dependencies) {
        Object.keys(fullSchema.dependencies).forEach(depKey => {
          const dep = fullSchema.dependencies[depKey]
          // cases where dependency does not apply
          if (!this.modelWrapper[this.modelKey]) return
          const val = this.getDeepKey(this.modelWrapper[this.modelKey], depKey)
          if ([null, undefined, false].includes(val)) return
          if (Array.isArray(val) && val.length === 0) return
          if (typeof val === 'object' && Object.keys(val).length === 0) return
          // dependency applies
          fullSchema.required = fullSchema.required.concat(dep.required || [])
          fullSchema.properties = fullSchema.properties.concat(this.objectToArray(dep.properties))
          // fullSchema.extraProperties = []
          if (dep.oneOf) fullSchema.oneOf = (fullSchema.oneOf || []).concat(dep.oneOf)
          if (dep.allOf) fullSchema.allOf = (fullSchema.allOf || []).concat(dep.allOf)
        })
      }
      // console.log('Full schema', fullSchema)
      return fullSchema
    },
    htmlDescription() {
      if (this.fullSchema && this.fullSchema.description) return md.render(this.fullSchema.description)
    },
    fullKey() { return (this.parentKey + this.modelKey).replace('root.', '') },
    label() { return this.fullSchema.title || (typeof this.modelKey === 'string' ? this.modelKey : '') },
    rules() {
      const rules = []
      if (this.required) {
        rules.push((val) => (val !== undefined && val !== null && val !== '') || this.options.requiredMessage)
      }
      if (this.fullSchema.type === 'array' && this.fullSchema.minItems !== undefined) {
        rules.push((val) => (!val || val.length >= this.fullSchema.minItems) || '')
      }
      if (this.fullSchema.type === 'array' && this.fullSchema.maxItems !== undefined) {
        rules.push((val) => (!val || val.length <= this.fullSchema.maxItems) || '')
      }
      if (this.fullSchema.type === 'string' && this.fullSchema.minLength !== undefined) {
        rules.push((val) => (val === undefined || val === null || val.length >= this.fullSchema.minLength) || '')
      }
      if (this.fullSchema.type === 'string' && this.fullSchema.maxLength !== undefined) {
        rules.push((val) => (val === undefined || val === null || val.length <= this.fullSchema.maxLength) || '')
      }
      if (this.fullSchema.type === 'string' && this.fullSchema.pattern !== undefined) {
        rules.push((val) => (val === undefined || val === null || new RegExp(this.fullSchema.pattern).test(val) || ''))
      }
      if (['number', 'integer'].includes(this.fullSchema.type) && this.fullSchema.maximum !== undefined) {
        rules.push((val) => (val === undefined || val === null || val <= this.fullSchema.maximum) || '')
      }
      if (['number', 'integer'].includes(this.fullSchema.type) && this.fullSchema.minimum !== undefined) {
        rules.push((val) => (val === undefined || val === null || val >= this.fullSchema.minimum) || '')
      }
      if (this.fullSchema.enum) {
        rules.push((val) => (val === undefined || val === null || !!this.fullSchema.enum.find(item => JSON.stringify(item) === JSON.stringify(val))) || '')
      }
      if (this.fullSchema.type === 'array' && this.fullSchema.items.enum) {
        rules.push((val) => (val === undefined || val === null || !val.find(valItem => !this.fullSchema.items.enum.find(item => JSON.stringify(item) === JSON.stringify(valItem)))) || '')
      }
      if (this.oneOfSelect && this.fullSchema.type !== 'array') {
        rules.push((val) => (val === undefined || val === null || !!this.fullSchema.oneOf.find(item => item.const === val)) || '')
      }
      if (this.oneOfSelect && this.fullSchema.type === 'array') {
        rules.push((val) => (val === undefined || val === null || !val.find(valItem => !this.fullSchema.items.oneOf.find(item => item.const === valItem))) || '')
      }
      if (this.fullSchema.step && this.apptInterval && (this.fullSchema.type === 'integer' || this.fullSchema.type === 'number' || this.fullSchema.type === 'string')) {
        rules.push((val) => (val === undefined || val === null || (val%this.apptInterval === 0 || 'Invalid value')))
      }
      if (['date', 'date-time'].includes(this.fullSchema.format)) {
        rules.push((val) => (val === undefined || val === null || (this.moment(val, this.dateFmt()).isValid()|| 'Invalid Date')))
      }
      return rules
    },
    fromUrl() {
      return !!(this.fullSchema['x-fromUrl'] && this.fullSchema['x-fromUrl'].indexOf('{q}') === -1)
    },
    fromUrlWithQuery() {
      return !!(this.fullSchema['x-fromUrl'] && this.fullSchema['x-fromUrl'].indexOf('{q}') !== -1)
    },
    fromUrlKeys() {
      // Look for variable parts in the URL used to fetch data
      if (!this.fullSchema['x-fromUrl']) return null
      return matchAll(this.fullSchema['x-fromUrl'], /\{(.*?)\}/g).toArray().filter(key => key !== 'q')
    },
    itemKey() {
      return this.fullSchema['x-itemKey'] || 'key'
    },
    itemTitle() {
      return this.fullSchema['x-itemTitle'] || 'title'
    },
    disabled() {
      return this.options.disableAll
    },
    foldable() {
      return this.options.autoFoldObjects && this.parentKey && this.fullSchema.title
    },
    oneOfConstProp() {
      if (!this.fullSchema.oneOf) return
      const props = this.fullSchema.oneOf[0].properties
      const key = Object.keys(props).find(p => !!props[p].const)
      if (!key) return
      return {...props[key], key, htmlDescription: md.render(props[key].description || '')}
    },
    oneOfRequired() {
      return !!(this.oneOfConstProp && this.fullSchema && this.fullSchema.required && this.fullSchema.required.find(r => r === this.oneOfConstProp.key))
    },
    oneOfRules() {
      const rules = []
      if (this.oneOfRequired) rules.push((val) => (val !== undefined && val !== null && val !== '') || this.options.requiredMessage)
      return rules
    },
    oneOfSelect() {
      return (this.fullSchema.type === 'array' && ['string', 'integer', 'number'].includes(this.fullSchema.items.type) && this.fullSchema.items.oneOf) || (['string', 'integer', 'number'].includes(this.fullSchema.type) && this.fullSchema.oneOf)
    },
    sortedData() {
      var byKey = this.modelWrapper[this.modelKey].slice(0);
      byKey.sort(function(a,b) {
        return a.key - b.key;
      })
      return byKey
    },
    cleanModel() {
      var byKey = JSON.parse(JSON.stringify(this.modelWrapper[this.modelKey])).slice(0);
      return byKey.map(a => delete a.fields)
    },

    isDateValid(fmt, val)
    {
      console.log(val, fmt)
    }
  },
  watch: {
    q(newVal) {
      // This line prevents reloading the list just after selecting an item in an auto-complete
      if (this.modelWrapper[this.modelKey] && this.modelWrapper[this.modelKey][this.itemTitle] === this.q) return
      this.getSelectItems()
      if (newVal === null || newVal === '') {
        this.selectItems = []
      }
      if (newVal && newVal.length > 3) {
        this.loading = true
      } else {
        this.loading = false
      }
    },
    modelWrapper : {
      handler: function (newVal) {
        if (['date', 'date-time'].includes(this.fullSchema.format)) {
          this.dateFormatted = this.formatDate(this.modelWrapper[this.modelKey])
        }
        if (this.fullSchema.map && this.modelWrapper[this.modelKey])
        {
          for (const x of this.fullSchema.map)
          {
            this.modelWrapper[x] = this.modelWrapper[this.modelKey][x]
          }
        }
      },
      deep: true
    },
    fullSchema: {
      handler() {
        if (this.fullSchema && JSON.stringify(this.fullSchema) !== this.lastFullSchema) {
          this.lastFullSchema = JSON.stringify(this.fullSchema)
          this.initFromSchema()
          this.cleanUpExtraProperties()
          this.applySubModels()
          this.ready = true
        }
      },
      immediate: true
    },
    currentOneOf(newVal, oldVal) {
      if (!this.currentOneOf) this.$set(this.subModels, 'currentOneOf', {})
      this.cleanUpExtraProperties()
    },
    subModels: {
      handler() {
        this.cleanUpExtraProperties()
        this.applySubModels()
      },
      deep: true
    },
    rawSelectItems: {
      handler() {
        this.updateSelectItems()
      },
      immediate: true
    }
  },
  methods: {
    createNew(array, source) {
      let data = {
        source: source === undefined ? this.modelKey : source,
        forms: array,
        val: this.q
      }
      this.$emit("createNew", data)
    },
    updateSelectItems() {
      // console.log('UPDATE SELECT ITEMS')
      const selectItems = []

      if (!this.rawSelectItems) {
        // nothing to do
      } else if (this.fullSchema['x-arrayType'] === 'custom') {
        this.rawSelectItems.forEach(item => selectItems.push(item))
      }else if (
        (this.fullSchema['x-arrayType'] !== 'custom' && (this.fullSchema['x-type'] === 'object' || this.fullSchema.type === 'object') && this.fullSchema.properties && Object.keys(this.fullSchema.properties).length) ||
        (this.fullSchema['x-arrayType'] !== 'custom' && this.fullSchema.type === 'array' && this.fullSchema.items && this.fullSchema.items.type === 'object' && this.fullSchema.items.properties && Object.keys(this.fullSchema.items.properties).length)
      ) {
        if (this.fullSchema.properties != null) {
          const keys = this.fullSchema.properties.map(p => p.key)
        } else {
          const keys = this.fullSchema.items.map(p => p.key)
        }

        this.rawSelectItems.forEach(item => {
          const filteredItem = {}
          keys.forEach(key => {
            if (item[key] !== undefined) filteredItem[key] = item[key]
          })
          selectItems.push(filteredItem)
        })
      } else {
        this.rawSelectItems.forEach(item => selectItems.push(item))
      }

      // always propose the existing values so they can be unchecked
      const model = this.modelWrapper[this.modelKey]
      const matchItem = (selectItem, item) => {
        const selectItemStr = JSON.stringify(typeof selectItem === 'object' ? selectItem[this.itemKey] : selectItem)
        const itemStr = JSON.stringify(typeof item === 'object' ? item[this.itemKey] : item)
        return selectItemStr === itemStr
      }
      if (model) {
        if (this.fullSchema.type === 'array' && this.fullSchema['x-arrayType'] !== 'custom') {
          model.reverse().forEach(item => {
            if (!selectItems.find(selectItem => matchItem(selectItem, item))) {
              selectItems.push(item)
            }
          })
        } else if (!selectItems.find(selectItem => matchItem(selectItem, model))) {
          selectItems.push(model)
        }
      }
      if(selectItems != null){
        this.customItems = selectItems.filter(si => !Array.isArray(si))
        if (this.fullSchema.mandatory) {
          if(this.customItems.length > 0) {
            this.fullSchema.mandatory.map(fd => {
              this.customItems.map(ci => {
                if (ci.key === fd) {
                  let count = this.modelWrapper[this.modelKey].filter(mm => mm.key === ci.key)
                  if (count.length === 0){
                    this.saveItem(this.modelWrapper[this.modelKey], ci)
                  }
                }
              })
            })
          }
        }
      }

      // we check for actual differences in order to prevent infinite loops
      if (JSON.stringify(selectItems) !== JSON.stringify(this.selectItems)) {
        this.selectItems = selectItems
      }
    },
    change() {
      // console.log('CHANGE FROM PLUGIN')
      this.updateSelectItems()
      let source = this.fullSchema['no-data-value'] === undefined ? this.modelKey : this.fullSchema['no-data-value']
      this.$emit('change', {key: this.fullKey.replace(/allOf-([0-9]+)\./g, ''), model: this.modelWrapper[this.modelKey], form: (this.fullSchema['no-data-form'] ? this.fullSchema['no-data-form'] : false), data_source: source})
    },
    input() {
      let source = this.fullSchema['no-data-value'] === undefined ? this.modelKey : this.fullSchema['no-data-value']
      this.$emit('input', {key: this.fullKey.replace(/allOf-([0-9]+)\./g, ''), model: this.modelWrapper[this.modelKey], form: (this.fullSchema['no-data-form'] ? this.fullSchema['no-data-form'] : false), data_source: source})
    },
    getDeepKey(obj, key) {
      const keys = key.split('.')
      for (let i = 0; i < keys.length; i++) {
        if ([null, undefined].includes(obj)) break
        obj = obj[keys[i]]
      }
      return obj
    },
    objectToArray(obj) {
      return Object.keys(obj || {}).map(key => ({...obj[key], key}))
    },
    defaultValue(schema) {
      if ((schema['x-type'] === 'object' || schema.type === 'object') && !schema['x-fromUrl'] && !schema['x-fromData'] && !schema['x-getData']) return {}
      if (schema.type === 'array') return []
      return null
    },
    getSelectItems: function (){
      if (!this.options.httpLib) return this.$emit('error', 'No http lib found to perform ajax request')
      let url = this.fullSchema['x-fromUrl'].replace('{q}', this.q || '')
      for (let key of this.fromUrlKeys) {
        // URL parameters are incomplete
        if (this.fromUrlParams[key] === undefined) return
        else url = url.replace(`{${key}}`, this.fromUrlParams[key])
      }
      this.loading = true
      if (this.q) {
        _.debounce(() => { this.fireApi(url) },800)
      } else {
        this.fireApi(url)
      }
    },
    fireApi (url) {
      this.options.httpLib.get(url)
        .then(res => {
          const body = res.data || res.body
          const items = this.fullSchema['x-itemsProp'] ? body[this.fullSchema['x-itemsProp']] : body
          if (!Array.isArray(items)) throw new Error(`Result of http fetch ${url} is not an array`)
          this.rawSelectItems = items
          this.loading = false
        })
        .catch(err => {
          this.$emit('error', err.message)
          this.loading = false
          this.rawSelectItems = []
        })
    },
    cleanUpExtraProperties() {
      // console.log('Cleanup extra properties')
      // cleanup extra properties
      if ((this.fullSchema['x-type'] === 'object' || this.fullSchema.type === 'object') && this.fullSchema.properties && Object.keys(this.fullSchema.properties).length && this.modelWrapper[this.modelKey]) {
        Object.keys(this.modelWrapper[this.modelKey]).forEach(key => {
          if (!this.fullSchema.properties.find(p => p.key === key)) {
            // console.log(`Remove key ${this.modelKey}.${key}`)
            delete this.modelWrapper[this.modelKey][key]
          }
        })
      }
    },
    applySubModels() {
      // console.log('Apply sub models')
      Object.keys(this.subModels).forEach(subModel => {
        Object.keys(this.subModels[subModel]).forEach(key => {
          if (this.modelWrapper[this.modelKey][key] !== this.subModels[subModel][key]) {
            // console.log(`Apply submodel ${this.modelKey}.${key}`, JSON.stringify(this.subModels[subModel][key]))
            this.$set(this.modelWrapper[this.modelKey], key, this.subModels[subModel][key])
          }
        })
      })
    },
    saveItem (array, obj) {
      this.customSchemaItems = this.fullSchema.items
      let a = {}
      if(obj[this.fullSchema['schema']].schema){
        this.customSchemaItems = obj[this.fullSchema['schema']].schema
        a = {
          [this.fullSchema['x-key']]: obj.id,
          title: obj[this.fullSchema['x-itemTitle']],
          key:obj.key,
          fields: obj[this.fullSchema['schema']].schema
        }
      }
      if (this.fullSchema['uniqueness']) {
        let duplicate = array.filter(ab => ab[this.fullSchema['x-key']]=== a[this.fullSchema['x-key']])
        if (duplicate.length === 0) {
          array.push(a)
        }
      } else {
        array.push(a)
      }
    },
    deleteItem(i) {
      this.modelWrapper[this.modelKey] = this.sortedData
      this.modelWrapper[this.modelKey].splice(i,1)
    },
    initFromSchema() {
      // console.log('Init from schema')
      let model = this.modelWrapper[this.modelKey]

      // Manage default values
      if (model === undefined) {
        model = this.defaultValue(this.fullSchema)
        if (this.fullSchema.default !== undefined) model = JSON.parse(JSON.stringify(this.fullSchema.default))
      }
      // const always wins
      if (this.fullSchema.const !== undefined) model = this.fullSchema.const

      // Case of a select based on ajax query
      if (this.fromUrl) this.getSelectItems()
      // Case of select based on an enum
      if ((this.fullSchema.type === 'array' && this.fullSchema.items.enum) || this.fullSchema.enum) {
        this.rawSelectItems = this.fullSchema.type === 'array' ? this.fullSchema.items.enum : this.fullSchema.enum
      }
      // Case of select based on a oneof on simple types
      if (this.oneOfSelect) {
        this.rawSelectItems = (this.fullSchema.type === 'array' ? this.fullSchema.items : this.fullSchema).oneOf.map(item => ({[this.itemKey]: item.const || (item.enum && item.enum[0]), [this.itemTitle]: item.title}))
      }
      // Case of an auto-complete field already defined
      if (this.fromUrlWithQuery && model && model[this.itemTitle] !== undefined) {
        this.q = model[this.itemTitle]
      }
      // Case of a select based on an array somewhere in the data
      if (this.fullSchema['x-fromData']) {
        this.$watch('modelRoot.' + this.fullSchema['x-fromData'], (val) => {
          this.rawSelectItems = val
        }, {immediate: true})
      }
      if (this.fullSchema['x-getData']) {
        this.$store.dispatch('GET_DATA', this.fullSchema['x-getData']).then(response => {
          this.rawSelectItems = response
        })
      }
      // Watch the dynamic parts of the URL used to fill the select field
      if (this.fromUrlKeys) {
        this.fromUrlKeys.forEach(key => {
          if (key.startsWith('context.')) {
            this.$watch('options.' + key, (val) => {
              this.fromUrlParams[key] = val
              this.getSelectItems()
            }, {immediate: true})
          } else {
            this.$watch('modelRoot.' + key, (val) => {
              this.fromUrlParams[key] = val
              this.getSelectItems()
            }, {immediate: true})
          }
        })
      }

      // Init subModels for allOf subschemas
      if ((this.fullSchema['x-type'] === 'object' || this.fullSchema.type === 'object') && this.fullSchema.allOf) {
        this.fullSchema.allOf.forEach((allOf, i) => {
          this.$set(this.subModels, 'allOf-' + i, JSON.parse(JSON.stringify(model)))
        })
      }

      // Case of a sub type selection based on a oneOf
      this.currentOneOf = null
      if ((this.fullSchema['x-type'] === 'object' || this.fullSchema.type === 'object') && this.fullSchema.oneOf && !this.currentOneOf && this.oneOfConstProp) {
        if (model && model[this.oneOfConstProp.key]) {
          this.currentOneOf = this.fullSchema.oneOf.find(item => item.properties[this.oneOfConstProp.key].const === model[this.oneOfConstProp.key])
        } else if (this.fullSchema.default) {
          this.currentOneOf = this.fullSchema.oneOf.find(item => item.properties[this.oneOfConstProp.key].const === this.fullSchema.default[this.oneOfConstProp.key])
        }
      }

      // apply date format for date or date-time fields with values
      if (model !== undefined && ['date', 'date-time'].includes(this.fullSchema.format)) {
        this.dateFormatted = this.formatDate(this.modelWrapper[this.modelKey])
      }

      // Init subModel for current oneOf
      if (this.currentOneOf) {
        this.$set(this.subModels, 'currentOneOf', JSON.parse(JSON.stringify(model)))
      } else {
        this.$set(this.subModels, 'currentOneOf', {})
      }

      this.$set(this.modelWrapper, this.modelKey, model)
    },
    formatDate (date) {
      if (!date) return null

      return this.moment(date).format(this.dateFmt())
    },
    parseDate (date) {
      if (date) {
        var d = this.moment(date, this.dateFmt())
        if (d.isValid())
          return d.format('YYYY-MM-DD')
      }

      return null
    },
     dateFmt()
    {

        this.moment.locale(window.navigator.userLanguage || window.navigator.language);
        return this.moment.localeData().longDateFormat('L');


    }
  }
}

</script>

<style lang="css">
.vjsf-property .array-card .v-card__text {
  padding: 6px 16px 0 16px;
}
.vjsf-property .array-card .v-card__actions {
  padding: 0 16px 6px 16px;
}

.vjsf-property .v-input--selection-controls {
  margin-top: 0;
}

.vjsf-tooltip p:last-child {
  margin-bottom: 0;
}
.v-input__slot{
  margin-bottom: 0;
}
.v-text-field--box>.v-input__control>.v-input__slot, .v-text-field--full-width>.v-input__control>.v-input__slot, .v-text-field--outline>.v-input__control>.v-input__slot {
  align-items: stretch;
  min-height: 45px;
}

.v-text-field--box input, .v-text-field--full-width input, .v-text-field--outline input {
  margin-top: 15px;
}

.v-text-field--box .v-label, .v-text-field--full-width .v-label, .v-text-field--outline .v-label {
  top: 11px;
}
.v-select.v-text-field--enclosed:not(.v-text-field--single-line) .v-select__selections {
  padding-top: 0;
}
.v-text-field.v-text-field--enclosed .v-input__append-inner, .v-text-field.v-text-field--enclosed .v-input__append-outer, .v-text-field.v-text-field--enclosed .v-input__prepend-inner, .v-text-field.v-text-field--enclosed .v-input__prepend-outer {
  margin-top: 10px;
}

.v-select.v-text-field--enclosed:not(.v-text-field--single-line) .v-select__selections {
  padding-top: 9px;
}
.v-text-field--box input, .v-text-field--full-width input, .v-text-field--outline input {
  margin-top: 16px;
}
.v-text-field input {
  padding: 2px 0;
}
.v-select__selection--comma {
  align-items: center;
  display: inline-flex;
  margin: 7px 4px 0px 0;
}
.v-subheader {
  height: auto;
}
</style>
