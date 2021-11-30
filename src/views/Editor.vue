<template>
    <div class="flex flex-col h-full bg-gray-100">
        <Navbar />
        <div class="flex">
            <div class="border border-gray-200 shadow-lg bg-white rounded-lg mt-8 pt-5 mx-5 w-full" id="editorjs"></div>
        </div>
    </div>
</template>

<script>
import EditorJS from '@editorjs/editorjs';
import Navbar from '@/components/Navbar.vue';

export default {
    name: "Editor",
    components: {
        Navbar
    },
    mounted() {
        const editor = new EditorJS();
    }
}
</script>

<style>
#editorjs {
	max-width: 900px;
}

.ce-block__content,
.ce-toolbar__content {
	max-width:calc(100% - 80px) !important;
}

.cdx-block {
	max-width: 100% !important;
}
</style>
