import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, IconButton, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { eventApi } from '../api/eventApi';
import DashboardLayout from '../layouts/DashboardLayout';
import AppTable from '../components/AppTable';
import AppLoader from '../components/AppLoader';
import AppModal from '../components/AppModal';
import AppInput from '../components/AppInput';
import AppDropdown from '../components/AppDropdown';
import AppSwitch from '../components/AppSwitch';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await eventApi.getCategories();
      if (res.success) {
        setCategories(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    reset({
      categoryName: '',
      categoryRId: '',
      slug: '',
      parentCategoryId: 0,
      description: '',
      seoTitle: '',
      seoDescription: '',
      categoryImageUrl: '',
      sortOrder: 0,
      showInMenu: true,
      isFeatured: false
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (category: any) => {
    setEditingCategory(category);
    reset({
      categoryName: category.categoryName,
      categoryRId: category.categoryRId || '',
      slug: category.slug || '',
      parentCategoryId: category.parentCategoryId || 0,
      description: category.description || '',
      seoTitle: category.seoTitle || '',
      seoDescription: category.seoDescription || '',
      categoryImageUrl: category.categoryImageUrl || '',
      sortOrder: category.sortOrder || 0,
      showInMenu: category.showInMenu !== false,
      isFeatured: !!category.isFeatured
    });
    setOpenModal(true);
  };

  const handleSaveCategory = async (data: any) => {
    try {
      const userStr = localStorage.getItem('user');
      const userObj = userStr ? JSON.parse(userStr) : null;
      const userEmail = userObj?.email || userObj?.userName || 'system';

      const payload = {
        categoryId: editingCategory ? editingCategory.categoryId : 0,
        categoryRId: data.categoryRId || (editingCategory ? editingCategory.categoryRId : ''),
        categoryName: data.categoryName,
        slug: data.slug,
        description: data.description,
        parentCategoryId: Number(data.parentCategoryId) || 0,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        categoryImageUrl: data.categoryImageUrl,
        sortOrder: Number(data.sortOrder) || 0,
        showInMenu: !!data.showInMenu,
        isFeatured: !!data.isFeatured,
        isActive: true,
        createdBy: editingCategory ? editingCategory.createdBy : userEmail,
        createdFrom: editingCategory ? editingCategory.createdFrom : 'WebUI',
        updatedBy: userEmail,
        updatedFrom: 'WebUI'
      };

      const res = await eventApi.addEditCategory(payload);
      toast.success(res.message || 'Category saved successfully.');
      setOpenModal(false);
      reset();
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save category.');
    }
  };

  const handleDelete = async (categoryRId: string) => {
    if (!categoryRId) {
      toast.error('Category identifier is missing.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await eventApi.deleteCategory(categoryRId);
      toast.success(res.message || 'Category deleted successfully.');
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete category.');
    }
  };

  // Get parent categories for dropdown (exclude self to prevent cyclic dependency)
  const parentCategoryOptions = [
    { label: 'None (Make it a Parent Category)', value: 0 },
    ...categories
      .filter((c: any) => c.parentCategoryId === 0 && (!editingCategory || c.categoryId !== editingCategory.categoryId))
      .map((c: any) => ({
        label: c.categoryName,
        value: c.categoryId
      }))
  ];

  const columns = [
    { header: 'Code', accessor: 'categoryRId' },
    { header: 'Category Name', accessor: 'categoryName' },
    {
      header: 'Type',
      accessor: (row: any) => (
        row.parentCategoryId === 0 ? (
          <Chip label="Parent" color="primary" variant="outlined" size="small" sx={{ fontWeight: 600 }} />
        ) : (
          <Chip label="Subcategory" color="secondary" variant="outlined" size="small" sx={{ fontWeight: 600 }} />
        )
      )
    },
    {
      header: 'Parent Category',
      accessor: (row: any) => row.parentCategoryId === 0 ? '—' : row.parentCategoryName || 'Parent'
    },
    {
      header: 'Featured',
      accessor: (row: any) => (
        <Chip
          label={row.isFeatured ? 'Yes' : 'No'}
          color={row.isFeatured ? 'success' : 'default'}
          size="small"
          sx={{ fontWeight: 600 }}
        />
      )
    },
    { header: 'Sort Order', accessor: 'sortOrder' },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton onClick={() => handleOpenEdit(row)} color="primary" size="small">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={() => handleDelete(row.categoryRId)} color="error" size="small">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h5" style={{ fontWeight: 800 }}>Event Categories</Typography>
          <Typography variant="body2" color="textSecondary">Manage parent event categories, subcategories, and metadata fields.</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={handleOpenAdd}
          style={{ textTransform: 'none', borderRadius: 8, fontWeight: 600 }}
        >
          Add Category
        </Button>
      </Box>

      {loading ? (
        <AppLoader message="Retrieving categories list..." />
      ) : (
        <AppTable
          columns={columns}
          data={categories}
          searchKey="categoryName"
          searchPlaceholder="Search categories..."
        />
      )}

      <AppModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        actions={
          <>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit(handleSaveCategory)}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <AppInput
                label="Category Name"
                register={register('categoryName', { required: 'Category Name is required' })}
                errorText={errors.categoryName?.message as string}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <AppInput
                label="Category Code (RId)"
                register={register('categoryRId')}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <AppInput
                label="URL Slug"
                register={register('slug')}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <AppDropdown
                label="Parent Category (Optional)"
                options={parentCategoryOptions}
                register={register('parentCategoryId')}
              />
            </Box>
          </Box>

          <AppInput
            label="Description"
            multiline
            rows={2}
            register={register('description')}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <AppInput
                label="SEO Title"
                register={register('seoTitle')}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <AppInput
                label="Category Image URL"
                register={register('categoryImageUrl')}
              />
            </Box>
          </Box>

          <AppInput
            label="SEO Description"
            multiline
            rows={2}
            register={register('seoDescription')}
          />

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <AppInput
                label="Sort Order"
                type="number"
                register={register('sortOrder')}
              />
            </Box>
            <Box sx={{ flex: 2, display: 'flex', gap: 4, justifyContent: 'flex-start', pl: 2 }}>
              <AppSwitch
                label="Show in Menu"
                register={register('showInMenu')}
              />
              <AppSwitch
                label="Featured"
                register={register('isFeatured')}
              />
            </Box>
          </Box>
        </Box>
      </AppModal>
    </DashboardLayout>
  );
};

export default CategoriesPage;
