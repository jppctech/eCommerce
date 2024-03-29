'use client'

import { AlterModal } from "@/components/modals/alert-modal"
import { Heading } from "@/components/ui/Heading"
import { ApiAlert } from "@/components/ui/api-alert"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useOrigin } from "@/hooks/use-origin"
import { zodResolver } from "@hookform/resolvers/zod"
import { Store } from "@prisma/client"
import axios from "axios"
import { Trash } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"

interface SettingsFormProps {
    initialData: Store
}

const formSchema = z.object({
    name: z.string().min(1)
})


type SettingsFormValue = z.infer<typeof formSchema>

export const SettingsForm: React.FC<SettingsFormProps> = ({
    initialData
}) => {

    const router = useRouter();
    const params = useParams();
    const origin = useOrigin();
    
    const[open, setOpen] = useState(false);
    const[loading, setLoading] = useState(false);

    const form = useForm<SettingsFormValue> ({
        resolver: zodResolver(formSchema),
        defaultValues: initialData
    });

    const onSubmit = async (data: SettingsFormValue) => {
        try{
            setLoading(true);
            await axios.patch(`/api/stores/${params.storeId}`, data)
            router.refresh();
            toast.success("Store updated")
        } catch(error) {
            toast.error("something went wromg.")
        } finally {
            setLoading(false)
        }
    }

    const onDelete = async () =>{
        try{
            setLoading(true)
            await axios.delete(`/api/stores/${params.storeId}`)
            router.refresh();
            router.push('/');
            toast.success("Store deleted.");

        } catch(error) {
            toast.error("Make sure you remove all products and categories first.")
        } finally {
            setLoading(false)
            setOpen(false)
        }
    }

    return (
        <>
        <AlterModal 
            isOpen={open}
            onClose={() => setOpen(false)}
            onConfirm={onDelete}
            loading={loading}
        />
            <div className="flex items-center justify-between">
                <Heading
                    title= "settings"
                    description= "Manage store preference"
                />
                <Button
                    disabled={loading}
                    variant={"destructive"}
                    size={"sm"}
                    onClick={()=> setOpen(true)}
                >
                    <Trash className="h-4 w-4"/>
                </Button>
            </div>
            <Separator/>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-8 w-full">
                    <div className="grid grid-cols-3 gap-8 pb-4">
                        <FormField
                            control={form.control}
                            name='name'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Store name" {...field}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button disabled={loading} className="ml-auto" type="submit">
                        Save changes
                    </Button>
                </form>
            </Form>
            <Separator/>
            <ApiAlert title="NEXT_PUBLIC_API_URL"
             description={`${origin}/api/${params.storeId}`}
            variant="public"
            />
        </>
    )
}