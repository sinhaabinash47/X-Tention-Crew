<template>
  <v-card class="my-8 mx-auto" elevation="16" :style="{ 'max-width': '75rem' }">
    <v-table>
      <thead>
        <tr>
          <th class="text-left">Name</th>
          <th class="text-left">Phone Number</th>
          <th class="text-left">Email</th>
          <th class="text-left">Hobbies</th>
          <th class="text-left">Action</th>
        </tr>
      </thead>
      <tbody class="bg-green-100">
        <tr v-for="(item, index) in paginatedData" :key="item" class="hover:bg-blue-200 hover:shadow-lg">
          <td>
            <template v-if="item.editMode">
              <v-text-field v-model="item.name"></v-text-field>
            </template>
            <template v-else>
              {{ item.name }}
            </template>
          </td>
          <td>
            <template v-if="item.editMode">
              <v-text-field v-model="item.phone"></v-text-field>
            </template>
            <template v-else>
              {{ item.phone }}
            </template>
          </td>
          <td>
            <template v-if="item.editMode">
              <v-text-field v-model="item.email"></v-text-field>
            </template>
            <template v-else>
              {{ item.email }}
            </template>
          </td>
          <td>
            <template v-if="item.editMode">
              <v-select v-model="item.selectedOption" :items="hobbies"></v-select>
            </template>
            <template v-else>
              {{ item.selectedOption }}
            </template>
          </td>
          <td>
            <template v-if="!item.editMode">
              <v-icon icon="mdi-pencil" @click="toggleEditMode(index)"></v-icon>
              <v-btn class="ma-2 text-red" icon="mdi-delete" @click="deleteItem(index)"></v-btn>
            </template>
            <template v-else>
              <v-icon icon="mdi-content-save" @click="updateItem(index)"></v-icon>
            </template>
          </td>
        </tr>
      </tbody>
    </v-table>
    <div class="text-right">
      <v-pagination v-model="page" :length="totalPages" prev-icon="mdi-menu-left"
        next-icon="mdi-menu-right"></v-pagination>
    </div>
    <v-snackbar v-model="showDeleteSuccess" color="success" timeout="3000">
      Item deleted successfully!
    </v-snackbar>
  </v-card>
</template>

<script setup>
import { ref, defineProps, toRefs, computed } from 'vue';
import { doc, collection, updateDoc, deleteDoc } from 'firebase/firestore';
import db from '../../firebase';

const props = defineProps(['formData']);
const { formData } = toRefs(props);

const itemsPerPage = 5;
const page = ref(1);

const hobbies = ['Cricket', 'Volleyball', 'Carrom Board', 'Hockey'];

const toggleEditMode = (index) => {
  formData.value[index].editMode = !formData.value[index].editMode;
};

const updateItem = async (index) => {
  try {
    const item = formData.value[index];
    const docRef = doc(collection(db, 'forms'), item.id);
    await updateDoc(docRef, {
      name: item.name,
      phone: item.phone,
      email: item.email,
      selectedOption: item.selectedOption,
    });
    toggleEditMode(index);
  } catch (error) {
    console.error('Error updating item:', error);
  }
};

const deleteItem = async (index) => {
  try {
    const item = formData.value[index];
    const docRef = doc(collection(db, 'forms'), item.id);
    await deleteDoc(docRef);
    formData.value = formData.value.filter((_, i) => i !== index);
    showDeleteSuccess.value = true;
  } catch (error) {
    console.error('Error deleting item:', error);
  }
};

const showDeleteSuccess = ref(false);

const paginatedData = computed(() => {
  const startIndex = (page.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return formData.value.slice(startIndex, endIndex);
});

const totalPages = computed(() => Math.ceil(formData.value.length / itemsPerPage));
</script>
