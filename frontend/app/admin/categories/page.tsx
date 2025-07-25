"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from 'react-hot-toast'
import axios from "axios";
import { Category } from "@/types/type"
import HeaderContentAdmin from "@/components/organisms/HeaderContetntAdmin/HeaderContentAdmin";
import TableComponents from "@/components/organisms/Table/TableComponents";
import ModalViewDetails from "@/components/organisms/Modal/ModalViewDetail";
import DeleteConfirmation from "@/components/Atoms/DeleteConfirmation";

const CategoriesPage = () => {
  const router = useRouter();

  const [category, setCategory] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalViewDetailOpen, setIsModalViewDetailOpen] = useState<boolean>(false);
  const [isModalConfirmationDeleteOpen, setIsModalConfirmationDeleteOpen] = useState<boolean>(false);
  const [selectedViewDetailCategory, setSelectedViewDetailCategory] = useState<Category | null>(null);
  const [selectedDeletedConfirmationCategory, setSelectedDeletedConfirmationCategory] = useState<Category | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(5);
  const [total, setTotal] = useState<number>(1);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [orderBy, setOrderBy] = useState<string>("asc");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchAllCategories = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/categories?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${orderBy}&searchQuery=${searchQuery}`);

      const result = response.data.data.map((category: any) => (
        {
          id: category.categoryId,
          ...category
        }
      ))

      setCategory(result || []);
      setTotal(response.data.total);
      
    } catch (error) {
      console.error("error when fetch all categories");
      toast.error("Error when fetching data categories")
    } finally {
      setIsLoading(false)
    }

  }

  useEffect(() => {
    fetchAllCategories();
  }, [page, total, orderBy, sortBy, searchQuery]);

  const handleDeletedCategory = async (category: Category | null) => {
    if (!category) {
      toast.error("No Category selected for deletion");
      return;
    }

    try {

      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/categories/${category?.id}`,
        {
          withCredentials: true
        }
      );

      toast.success("Category deleted Successfully", { duration: 2000 });

      setTimeout(() => {
        setIsModalConfirmationDeleteOpen(false);
        fetchAllCategories();
      }, 1000);

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "An unexpected error occurred. Please try again.";
      toast.error(errorMessage);
      console.error('Error when submitting new category', error)
    }
  }


  // open & close Modal view detail
  const handleOpenCloseModalViewDetail = (category?: Category) => {
    setSelectedViewDetailCategory(category || null);
    setIsModalViewDetailOpen(!isModalViewDetailOpen);
  }

  // open & close Modal Close Confirmation
  const handleOpenCloseModalConfirmationDelete = (category?: Category) => {
    setSelectedDeletedConfirmationCategory(category || null);
    setIsModalConfirmationDeleteOpen(!isModalConfirmationDeleteOpen);
  }


  return (
    <>
      <div className="flex px-8 mx-3 my-2 flex-col rounded-2xl bg-white">
        {/*Title */}
        <HeaderContentAdmin
          header="Category"
          subHeader="List of all Categories"
          labelAdd="Add Category"
          tableType="categories"
          columns={[
            { key: 'prefix', label: 'Prefix' },
            { key: "name", label: "Name" },
            { key: "description", label: "description" }
          ]}
          totalItems={total}
          onChangeDropDownLimitData={setLimit}
          onChangeDropDownOrderBy={setOrderBy}
          onChangeDropDownSortBy={setSortBy}
          onChangeSearchQuery={setSearchQuery}
          toAddPage={() => router.push('/admin/categories/add')}
        />

        {!isLoading ? (
          <TableComponents
            data={category}
            columns={[
              { key: 'prefix', label: 'Prefix' },
              { key: "name", label: "Name" },
              { key: "description", label: "Description" }
            ]}
            onEdit={() => { }}
            onDelete={(id) => { handleOpenCloseModalConfirmationDelete(category.find(category => category.id === id)) }}
            tableType="categories"
            page={page}
            limit={limit}
            totalItems={total}
            onPageChange={setPage}
          />
        ) : (<div>Loading...</div>)}

      </div>

      <ModalViewDetails
        isOpen={isModalViewDetailOpen}
        onClose={handleOpenCloseModalViewDetail}
        tableType="categories"
        data={selectedViewDetailCategory}
        columns={[
          { key: 'prefix', label: 'Prefix' },
          { key: "name", label: "Name" },
          { key: "description", label: "Description" }
        ]}
      />

      <DeleteConfirmation
        isOpen={isModalConfirmationDeleteOpen}
        onClose={() => setIsModalConfirmationDeleteOpen(false)}
        onConfirm={() => handleDeletedCategory(selectedDeletedConfirmationCategory)}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
      />

      <Toaster />
    </>
  )
}

export default CategoriesPage;