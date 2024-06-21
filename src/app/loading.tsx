import { Icons } from '@/components/icons-shad-cn'

const Loading = () => {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <Icons.spinner className="animate-spin w-10 h-10 text-blue-600" />
    </div>
  )
}

export default Loading
