<template>
    <v-badge v-if="value.isLoaded" :content="value.rank" bottom :offset-x="(size/64)*7+14" :offset-y="(size/64)*7+14"
             color="orange">
        <v-avatar :size="size"
                  @click.native="avatar_click" @dblclick.native="avatar_dblclick">
            <img :src="value.photo || '/img/logo_circle.png'" style="object-fit: cover; "/>
        </v-avatar>
    </v-badge>
</template>
<script>
    import logger from "./mixin/logger"
    import {Kopnik} from "../models";

    export default {
        name: "KAvatar",
        mixins: [logger],
        components: {
        },
        data: () => {
            return {
            }
        },
        props: {
            size: {
                type: Number,
                default: 48
            },
            value: {
                type: Kopnik
            },
        },
        methods:{
           avatar_click(event){
               this.$emit('click', event)
           },
           avatar_dblclick(event){
               this.$emit('dblclick', event)
           }
        },
        async created() {
            await this.value.loaded()
        },
        async mounted() {
        }
    }
</script>
