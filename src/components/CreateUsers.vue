<template>
    <v-layout>
        <v-app-bar color="teal-darken-4" image="https://picsum.photos/1920/1080?random">
            <template v-slot:image>
                <v-img gradient="to top right, rgba(19,84,122,.8), rgba(128,208,199,.8)"></v-img>
            </template>
            <v-app-bar-title>X Tention Crew</v-app-bar-title>
            <v-text-field :loading="loading" density="compact" variant="solo" label="Search users"
                append-inner-icon="mdi-magnify" single-line hide-details @click:append-inner="onClick"
                v-model="searchText"></v-text-field>

            <v-spacer></v-spacer>

            <v-row justify="space-around">
                <v-col cols="auto">
                    <v-dialog transition="dialog-top-transition" width="30rem" v-model="isActive">
                        <template v-slot:activator="{ props }">
                            <div class="border-double border-4 border-light-blue-500">
                                <v-btn color="white" v-bind="props">ADD NEW</v-btn>
                            </div>
                        </template>
                        <template v-slot:default="{ isActive }">
                            <v-card>
                                <v-card-title class="text-h5">Add Users</v-card-title>
                                <hr />
                                <v-card-text>
                                    <form @submit.prevent="submit"
                                        class="max-w-md mx-auto p-8 bg-white shadow-md rounded">
                                        <v-text-field v-model="name.value.value"
                                            :error-messages="name.errorMessage.value" label="Name"></v-text-field>
                                        <v-text-field v-model="phone.value.value"
                                            :error-messages="phone.errorMessage.value"
                                            label="Phone Number"></v-text-field>
                                        <v-text-field v-model="email.value.value"
                                            :error-messages="email.errorMessage.value" label="E-mail"></v-text-field>
                                        <v-select v-model="select.value.value" :items="items"
                                            :error-messages="select.errorMessage.value" label="Select">
                                        </v-select>
                                        <div class="text-right">
                                            <v-btn class="me-4" type="submit">submit</v-btn>
                                            <v-btn variant="text" @click="isActive.value = false">Close</v-btn>
                                        </div>
                                    </form>
                                </v-card-text>
                            </v-card>
                        </template>
                    </v-dialog>
                </v-col>
            </v-row>
        </v-app-bar>
        <v-main>
            <ShowList :formData="filteredData" @item-deleted="updateFormDataAfterDelete" />
        </v-main>
    </v-layout>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useField, useForm } from 'vee-validate'
import { collection, addDoc, getDocs, onSnapshot } from 'firebase/firestore';
import db from '../../firebase';
import ShowList from './ShowList.vue';

const { handleSubmit } = useForm({
    validationSchema: {
        name(value) {
            if (value?.length >= 2) return true
            return 'Name needs to be at least 2 characters.'
        },
        phone(value) {
            if (value?.length === 10 && /^\d+$/.test(value)) return true;
            return 'Phone number must be exactly 10 digits and contain only numbers.';
        },
        email(value) {
            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return true;
            return 'Must be a valid e-mail.';
        },
        select(value) {
            if (value) return true
            return 'Select an item.'
        }
    },
});
const isActive = ref(false);
const name = useField('name');
const phone = useField('phone');
const email = useField('email');
const select = useField('select');
const searchText = ref('');

const items = ref(['Cricket', 'Volleyball', 'Carrom Board', 'Hockey']);
const formData = ref([]);
const deleteItemIndex = ref(null);


const updateFormDataAfterDelete = () => {
    const formsCollection = collection(db, 'forms');
    getDocs(formsCollection).then((querySnapshot) => {
        formData.value = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    });
};

const submit = handleSubmit(async (values) => {
    try {
        const formCollection = collection(db, 'forms');
        await addDoc(formCollection, {
            name: values.name,
            phone: values.phone,
            email: values.email,
            selectedOption: values.select,
        });
        name.value.value = '';
        phone.value.value = '';
        email.value.value = '';
        select.value.value = null;
        const querySnapshot = await getDocs(formCollection);
        formData.value = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        if (deleteItemIndex.value !== null) {
            formData.value.splice(deleteItemIndex.value, 1);
            deleteItemIndex.value = null;
        }
        isActive.value = false;
    } catch (error) {
        console.error('Error submitting form:', error);
    }
});
const fetchFormData = () => {
    const formsCollection = collection(db, 'forms');
    //   getDocs(formsCollection).then((querySnapshot) => {
    //       formData.value = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    // })
    // .catch((error) => {
    //   console.error('Error fetching data:', error);
    // });
    const unsubscribe = onSnapshot(formsCollection, (querySnapshot) => {
        formData.value = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    });
    return unsubscribe;
};
onMounted(fetchFormData);
onUnmounted(() => {
    unsubscribe();
});

const filteredData = computed(() => {
    const term = searchText.value.toLowerCase();
    return formData.value.filter((user) =>
        user.name.toLowerCase().includes(term) ||
        user.phone.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.selectedOption.toLowerCase().includes(term)
    );
});
</script>
