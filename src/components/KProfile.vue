<template>
  <v-container v-if="request"
               fluid class="fill-height">
    <ValidationObserver ref="obs" v-slot="{ invalid, validated, passes, validate }"
                        tag="div" class="mx-auto" style="width: 100%; max-width:350px">
      <v-card elevation="12">
        <v-card-text>
          <v-form>
            <v-alert v-if="isMessagesFromGroupAllowed!==undefined" ref="alert" :color="alertColor" v-html="alertHtml">
            </v-alert>
            <kopnik-vue ref="request"
                        :value="request"
                        locale fio role location
                        @locale_change="locale_change"
            ></kopnik-vue>
            <v-list v-if="wasMessagesFromGroupAllowed===false">
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title style="white-space: inherit !important;">{{
                      $t('profile.messagesFromGroup.allow')
                    }}
                  </v-list-item-title>
                  <!--doc: https://vk.com/dev/Subscribe?link=https%3A%2F%2Fvk.com%2Fsvetoslav_igorevich&mode=0&oid=573258821-->
                  <div id="vk_allow_messages_from_community" class="text-center my-3"></div>
                </v-list-item-content>
              </v-list-item>
              <slot></slot>
            </v-list>
            <div v-if="env==='development'">
              {{ changeset }}
            </div>


            <!--            Диалог подтверждения-->
            <v-dialog ref="submitDialog"

                      v-model="submitDialog"
                      :max-width="450"
            >
              <!--         кнопка-активатор-->
              <template v-slot:activator="{ on, attrs }">
                <v-btn ref="confirm"
                       color="primary" block
                       :disabled="invalid || !isMessagesFromGroupAllowed || !request.location.lat || changeset.length===0"
                       v-bind="attrs"
                       v-on="on"
                >
                  {{ $t('profile.submit') }}
                </v-btn>
              </template>
              <v-card>
                <v-card-title>
                  <v-avatar :size="128" class="mr-7"><img src="img/avatar.png"></v-avatar>
                  {{ $t('profile.submitDialog.title') }}
                </v-card-title>
                <v-card-text>
                  {{ $t('profile.submitDialog.text') }}
                  <ul>
                    <li v-for="eachField of changesetTranslated">
                      {{ eachField }}
                    </li>
                  </ul>
                </v-card-text>
                <v-card-actions>
                  <v-btn ref="submitYes" text color="primary" @click="onSubmitYes" class="flex-grow-1"
                         v-promise-btn
                  >
                    {{ $t('dialog.yes') }}
                  </v-btn>
                  <v-btn ref="submitNo" text color="secondary" @click="submitDialog=false" class="flex-grow-1">
                    {{ $t('dialog.no') }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-form>
        </v-card-text>
      </v-card>
    </ValidationObserver>
  </v-container>
</template>
<script>
import {
  ValidationObserver,
} from "vee-validate"

import {Kopnik} from "../models"
import {bottle, container} from "../bottle/bottle";
import logger from "./mixin/logger";
import KopnikVue from "./KopnikVue";
import api from "../api";
import parse from "@/models/utils/parse";

export default {
  mixins: [logger],
  name: "Profile",
  components: {
    ValidationObserver,
    KopnikVue,
  },

  data() {
    return {
      submitDialog: false,
      env: container.env,
      application: container.application,
      request: null,
      // в текущий момент
      isMessagesFromGroupAllowed: undefined,
      // при инициализации страницы
      wasMessagesFromGroupAllowed: undefined,
    }
  },
  props: {},
  computed: {
    /**
     * набор изменений относительно текущего пользователя
     */
    changeset() {
      // использую знак == из-за года рождения
      const result = ['firstName', 'lastName', 'patronymic', /*'birthYear'*/, 'role',/* 'passport'*/,].filter(eachField => this.application.user[eachField] != this.request[eachField])

      // location
      if (this.application.user.location.lat !== this.request.location.lat || this.application.user.location.lng !== this.request.location.lng) {
        // доп проверка на один косяк карты на мобильном. Почему-то изменяется значение lat (незначительно) при открытии виртуальной клавиатуры внизу экрана
        if (this.application.user.location.lng !== this.request.location.lng || Math.abs(this.application.user.location.lat - this.request.location.lat) > 0.0001) {
          result.push('location')
        }
      }
      return result
    },
    changesetTranslated() {
      const result = this.changeset.map(eachField => container.application.getMessage(`profile.${eachField}`))
      return result
    },
    alertColor() {
      return this.application.user.status === Kopnik.Status.CONFIRMED && this.isMessagesFromGroupAllowed? 'info' : 'warning'
    },
    alertHtml() {
      if (this.isMessagesFromGroupAllowed === undefined) {
        return undefined
      } else if (this.isMessagesFromGroupAllowed) {
        // ждет когда Свв примет заявку в друзья
        if (this.application.user.status === Kopnik.Status.PENDING && !this.application.user.witnessChatInviteLink) {
          return this.$t(`profile.alert[5]`, {witnessChatInviteLink: this.application.user.witnessChatInviteLink})
        } else {
          return this.$t(`profile.alert[${this.application.user.status}]`, {witnessChatInviteLink: this.application.user.witnessChatInviteLink})
        }
      } else {
        return this.$t(`profile.alert[4]`)
      }
    }
  },
  watch: {},
  methods: {
    async onSubmitYes() {
      // this.request.birthYear = parseInt(this.request.birthYear)
      await this.application.user.updateProfile(this.request, this.changeset)
      this.application.infos.push(this.$t('profile.submitMessage'))
      await this.application.setSection(container.application.constructor.Section.Main)
    },
    /**
     * Здесь локаль сохраняется потому что этот компонент отображает только текущего пользователя,
     * который может вызвать api/users/setLocale()
     *
     * @param {Locale} event
     * @returns {Promise<void>}
     */
    async locale_change(event) {
      // задаем локаль текущему пользователю
      await this.application.user.setLocale(event)
      this.application.localeManager.currentLocale = event
    }
  },
  async created() {
    let user = await this.application.resolveUser()

    this.request = new Kopnik
    this.request.merge(parse(Kopnik, this.application.user.plain))
    if (!this.request.location.lat) {
      this.request.location = {
        lat: 54.763,
        lng: 32.106,
      }
    }
    const tmp = this.request
  },
  async mounted() {
    this.wasMessagesFromGroupAllowed = this.isMessagesFromGroupAllowed = await this.application.user.isMessagesFromGroupAllowed()
    // doc: https://vk.com/dev/widget_subscribe
    if (!this.isMessagesFromGroupAllowed) {
      container.VK.Widgets.Subscribe("vk_allow_messages_from_community", {
        mode: 1,
        soft: 1,
      }, container.constants.messenger.svetoslav_id);
      container.VK.Observer.subscribe("widgets.subscribed", (userId) => {
        this.isMessagesFromGroupAllowed = true
      })
      container.VK.Observer.subscribe("widgets.unsubscribed", (userId) => {
        this.isMessagesFromGroupAllowed = false
      })
    }
  },
  beforeDestroy() {
    container.VK.Observer.unsubscribe("widgets.allowMessagesFromCommunity.allowed")
    container.VK.Observer.unsubscribe("widgets.allowMessagesFromCommunity.denied")
  },
}
</script>
