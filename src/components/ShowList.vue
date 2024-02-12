<template>
  <v-card class="my-8 mx-auto" elevation="16" :style="{ 'max-width': '75rem' }">
    <v-table>
      <thead>
        <tr>
          <th class="text-left">Sr. No.</th>
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
            <v-badge color="error" :content="index + 1" inline></v-badge>
          </td>
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
              <v-dialog v-model="alertDialog" persistent width="auto">
                <template v-slot:activator="{ props }">
                  <v-btn class="ma-2 text-red" v-bind="props" icon="mdi-delete" @click="openDeleteDialog(index)"></v-btn>
                </template>
                <v-card>
                  <v-card-title class="text-h5 text-red">
                    Delete!
                  </v-card-title>
                  <v-card-text>Do You want to delete this user.</v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green-darken-1" variant="text" @click="closeDeleteDialog">
                      No
                    </v-btn>
                    <v-btn color="green-darken-1" variant="text" @click="confirmDelete">
                      Yes
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </template>
            <template v-else>
              <v-icon icon="mdi-content-save" @click="updateItem(index)"></v-icon>
            </template>
          </td>
        </tr>
      </tbody>
    </v-table>
    <div v-if="loading" class="loader-overlay">
      <div class="loader"></div>
    </div>
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
import { doc, collection, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import db from '../../firebase';
import { getCurrentInstance } from 'vue';

const instance = getCurrentInstance();
const loading = ref(false);

const props = defineProps(['formData']);
const { formData } = toRefs(props);

const itemsPerPage = 5;
const page = ref(1);
const alertDialog = ref(false);
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
    loading.value = true;

    const formCollection = collection(db, 'forms');
    const item = formData.value[index];
    const docRef = doc(formCollection, item.id);
    await deleteDoc(docRef);
    formData.value.splice(index, 1);

    const querySnapshot = await getDocs(formCollection);
    formData.value = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    showDeleteSuccess.value = true;
  } catch (error) {
    console.error('Error deleting item:', error);
  } finally {
    loading.value = false;
  }
};

const openDeleteDialog = (index) => {
  deleteItemIndex.value = index;
  alertDialog.value = true;
};

const closeDeleteDialog = () => {
  alertDialog.value = false;
};

const confirmDelete = async () => {
  alertDialog.value = false;
  await deleteItem(deleteItemIndex.value);
  deleteItemIndex.value = null;
  instance.emit('item-deleted');
};

const deleteItemIndex = ref(null);
const showDeleteSuccess = ref(false);

const paginatedData = computed(() => {
  const startIndex = (page.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return formData.value.slice(startIndex, endIndex);
});

const totalPages = computed(() => Math.ceil(formData.value.length / itemsPerPage));
</script>


<style>
.loader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loader {
  border: 8px solid #f3f3f3;
  border-top: 8px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
