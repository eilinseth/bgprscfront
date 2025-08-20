import {  useState , useEffect } from "react"
import axios,{AxiosError} from "axios"
import  {useForm} from "react-hook-form"
import * as THREE from "three"
import NET from "vanta/src/vanta.net"

 

type FormValues = {
  asn : string
  addresListName : string
  fileName : string
}

type VantaEffect = {
  destroy : () => void
}

function App() {
  const [lang,setLang] =useState<"en"|"id">("en")
  const [loading,setIsLoading] = useState(false)
  const {register , handleSubmit , formState:{errors},reset} = useForm<FormValues>()
  const [downloadUrl,setDownloadUrl] = useState("")
  const [fileName , setFileName] = useState("")
  const [errorMessage,setErrorMessage] = useState("")
  const [vantaEffect,setVantaEffect] = useState<VantaEffect | null>(null)

  useEffect(() => {
    if(!vantaEffect){
      const effect = NET({
        el: "#bg-main",
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x6969f2,
        backgroundColor: 0x8040f,
        maxDistance: 25.00,
        spacing: 16.00
})
  setVantaEffect(effect)
    }
    return() =>{
      if(vantaEffect) vantaEffect.destroy()
    }
  },[vantaEffect])

 
  function onSubmit(values:FormValues){
      setFileName(values.fileName)
      setIsLoading(true)
      setDownloadUrl("")

      async function getBGPJson () {
        try{

          //fetching dari backend buat hindarin cors
          const req = await axios.get(`http://localhost:5000/api/asn/${values.asn}`)
          const res =  req.data
          const data = res.data
          

          //misahin ipv4 sama ipv6
          const ipv4 = data.ipv4_prefixes.map((item : {prefix : string}) => `ip firewall address-list add address=${item.prefix} list=${values.addresListName}`)
          const ipv6 = data.ipv6_prefixes.map((item : {prefix : string}) => `ipv6 firewall address-list add address=${item.prefix} list=${values.addresListName}`)
          //gabungin sintaks firewall di mikrotik nya
          const rscContent = `${ipv4.join("\n")}\n${ipv6.join("\n")}`
          console.log(rscContent)

          //buat file download
          const blob = new Blob([rscContent],{type:"text/plain"})
          const url  = URL.createObjectURL(blob)

          setDownloadUrl(url)
        
        reset()

        }
        catch(err){
          setDownloadUrl("")
          if(axios.isAxiosError(err)){
            const axiosErr = err as AxiosError<{message?:string,error?:string}>
          

            if(axiosErr.response?.data?.message){
              setErrorMessage(axiosErr.response.data.message)
            }

            else if (axiosErr.response?.data?.error) {
              setErrorMessage(axiosErr.response.data.error)
            }

            else if (axiosErr.request){
              setErrorMessage("No respond from server")
            }else{
              setErrorMessage(axiosErr.message)
            }
          }else{
            setErrorMessage("Unknown Error")
          }
        }finally{
        setIsLoading(false)
        }
      }

      getBGPJson()

  }
  return (
    <div className="scroll-smooth ">
    <div id="bg-main" className="  h-screen w-screen  ">
      <div className="bg-white/20 backdrop-blur-sm w-screen h-screen ">
      <section className="px-[6%] pt-20 md:pt-50 ">
        <h1 className="font-bold text-white drop-shadow-black drop-shadow-xs text-4xl mt-20 md:-mt-14 ">{lang === "en" ? "BGPview ASN to MikroTik RSC" : "ASN BGPview ke RSC MikroTik"}</h1>
      </section>

        <div className="flex justify-center items-center lg:max-w-[55%] md:max-w-[70%] sm:max-w-[78%] max-w-[85%] sm:mt-4 sm:ml-10 md:mt-2 md:ml-12 lg:ml-20 ml-8 lg:h-40  lg:-mt-2  lg:p-5 mt-5 px-2 py-2 bg-slate-300/40 shadow-lg shadow-white rounded-lg">
          {lang === "en" ? (
            <p className="font-semibold mt-4 lg:mt-0  drop-shadow-lg drop-shadow-white text-black/70">BGPView ASN to Mikrotik RSC is a simple web tool that converts ASN prefix data from the BGPView API into a MikroTik RouterOS <span className="font-bold text-slate-800 border-black w-fit px-1 bg-gray-200">.rsc</span> script.
            This allows network administrators to quickly import complete IP ranges of a specific organization or service directly into MikroTik’s firewall address list.
            Ideal for blocking or allowing entire ASN ranges without manually adding IP addresses.</p>
          ): (
            <p className="font-semibold mt-4 lg:mt-0 drop-shadow-lg drop-shadow-white text-black/70">
              BGPView ASN to Mikrotik RSC adalah alat web sederhana yang mengonversi data prefix ASN dari API BGPView menjadi script <span className="font-bold text-slate-800 border-black w-fit px-1 bg-gray-200">.rsc</span> untuk MikroTik RouterOS.
              Dengan ini, administrator jaringan dapat dengan cepat mengimpor seluruh rentang IP dari suatu organisasi atau layanan langsung ke address list firewall MikroTik.
              Cocok untuk memblokir atau mengizinkan seluruh ASN tanpa perlu menambahkan alamat IP secara manual.
            </p>
          )}
        </div>
          <div className="flex gap-2 lg:mt-6 lg:ml-21 md:ml-12 mt-6 ml-8 sm:ml-10">
            <button onClick={() => setLang("en")} className="bg-blue-500 text-white px-3 py-1 rounded font-bold cursor-pointer">EN</button>
        <button onClick={() => setLang("id")} className="bg-green-500 text-white px-3 py-1 rounded font-bold cursor-pointer">ID</button>
          </div>
      </div>
    </div>
        <section className="min-h-screen w-screen bg-slate-300 pb-15 pt-30  md:px-20 " >
          <h1 className="text-center mb-10 text-4xl bg-linear-90 md:mb-20 from-[#3B82F6] to-[#9333EA] bg-clip-text text-transparent font-bold">{lang === "en" ? "Generate Mikrotik Firewall Script" : "Membuat Script Firewall Mikrotik"}</h1>

          <div className="flex justify-center items-center flex-col gap-5">
            <div className="w-[85%]  h-50 md:h-[calc(100vh-150px)]">
              <form action="" className="flex gap-8 flex-col justify-center items-center bg-linear-90 from-[#3B82F6] to-[#9333EA] bg-clip-text text-transparent text-lg " onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-2">
                <label htmlFor="" className="font-bold">{lang === "en" ? "Input ASN Number :" : "Masukan nomor ASN"}</label>
                <input type="text" placeholder="......." className="text-black py-0.5 px-2 bg-slate-100  font-semibold w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                {...register("asn",{required : "Cannot Empty",pattern:{value : /^\d+$/, message:"ASN must a number"}})} />
                    {errors.asn && (<p className="text-red-600 md:-mt-1 md:-mb-2 font-semibold">{errors.asn.message}</p>)}
                </div>
                <div className="flex flex-col gap-2">

                <label htmlFor="" className="font-bold">{lang === "en" ? "Address list name :" : "Nama Address List :" }</label>
                <input type="text" placeholder="......." className="text-black py-0.5 px-2 bg-slate-100  font-semibold w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                {...register("addresListName", {required:{value:true,message: "Cannot Empty "} , minLength:{value:4 , message:"Minimal 4 Character"}})}
                />
                    {errors.addresListName && (<p className="text-red-600 md:-mt-1 md:-mb-2 font-semibold">{errors.addresListName.message}</p>)}
                </div>
                <div className="flex flex-col gap-2">

                <label htmlFor="" className="font-bold">{lang === "en" ? "File Name :" : "Nama File :"}</label>
                <input type="text" placeholder="......." className="text-black py-0.5 px-2 bg-slate-100  font-semibold w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                {...register("fileName",{required:{value:true , message:"Cannot Empty" }, minLength:{value : 4 , message : "Minimal 4 Character"}})}
                />
                    { errors.fileName && (<p className="text-red-600 md:-mt-1 md:-mb-2 font-semibold">{errors.fileName.message}</p>)}
                </div>

                <button className="w-40 text-white font-bold cursor-pointer  bg-green-500 py-1 px-2 rounded-2xl">Submit</button>
              </form>
            </div>

            {loading &&  (
              <div className="mt-35 md:-mt-30 flex flex-col gap-4 justify-center items-center">
                <p className="text-purple-500 text-2xl font-semibold">Loading...</p>
                <div className="w-10 h-10 border-2 border-t-transparent border-[navy] rounded-full animate-spin"></div>
              </div>
            )}

            {!loading && !downloadUrl && errorMessage && (
              <div className="mt-35 md:-mt-30 flex flex-col gap-4 justify-center items-center">
                <p className="text-2xl text-red-600 font-semibold md:mt-6">{lang === "en" ? errorMessage : "Nomor ASN tidak ada"}</p>
              </div>
            )}

            {!loading && downloadUrl && (
              <div className="mt-35 md:-mt-30 flex flex-col gap-4 justify-center items-center"><p className="text-purple-500 text-2xl font-semibold">Loading is done</p>
                <a href={downloadUrl}
                download={`${fileName}.rsc`}
                className="bg-green-600 text-white px-4 py-2 rounded font-bold"
                >Download {fileName}.rsc</a>
              </div>

            )}



          </div>
        </section>

        <section className="min-h-screen w-screen bg-slate-800 py-16  lg:px-20 ">
          
            <div className=" mx-auto ">
                  <h1 className="text-4xl text-center font-bold bg-linear-90 from-sky-400 to-purple-500 bg-clip-text text-transparent ">{lang === "en" ? "How to Block Facebook ASN on MikroTik" : "Cara Memblokir ASN Facebook pada MikroTik"}</h1>
            <div className="text-white font-semibold  mt-20 text-sm ">
              <ol className="list-decimal list-outside px-[2rem] sm:max-w-[80%] md:max-w-screen space-y-10 mx-auto  ">
                <li className="">
                    <p>{lang === "en" ?  "Get the ASN number from" : "Dapatkan nomor ASN dari"}<a target="_blank" href="https://bgpview.io/" className="font-bold"> bgpview.io</a></p>
                  <div className="flex flex-col md:flex-row ">
                  <img src="/tutorial/1.png" className="w-100 lg:w-130 lg:h-70 mt-2 ml-4" alt="" />
                  <img src="/tutorial/2.png" className="w-100 lg:w-130 lg:h-70 mt-2 ml-4" alt="" />
                  </div>
                </li>
                <li className="mt-20">
                  {lang === "en" ? "Fill the form with ASN Number, Address List name (decide naming of address-list in MikroTik), and File Name (decide the file name for downloaded)" : "Isi form dengan nomor ASN, Nama Address List (untuk penamaan address-list di MikroTik), dan Nama File (untuk penamaan nama file yang akan diunduh)"
                  }
                  <div className="flex flex-col md:flex-row">
                  <img src="/tutorial/3.png" className="w-100 lg:w-130 lg:h-90 mt-2 ml-4" alt="" />
                  <img src="/tutorial/5.png" className="w-100 lg:w-100 lg:h-90 mt-2 ml-4 md:ml-20" alt="" />
                  
                  </div>
                </li>
                <li className="mt-20">
                  {lang === "en" ? "Download the file" : "Unduh file nya"}
                  <div className="flex flex-col md:flex-row">
                  <img src="/tutorial/4.png" className="w-100 lg:w-130 lg:h-80 mt-2 ml-4" alt="" />
                  <img src="/tutorial/6.png" className="w-100 lg:w-130 h-20 lg:h-30 mt-2 ml-4" alt="" />
                  </div>
                </li>
                <li className="mt-20">
                  {lang === "en" ? "Drag the file into Files menu in MikroTik": "Seret/tarik file ke menu Files di MikroTik"
                  }
                  <div className="flex flex-col md:flex-row">
                  <img src="/tutorial/7.png" className="w-100 lg:w-130 lg:h-90 mt-2 ml-4" alt="" />
                  <img src="/tutorial/8.png" className="w-100 lg:w-130 h-40 lg:h-50 mt-2 ml-4" alt="" />
                  </div>
                </li>
                <li className="mt-20">
                    <p>{lang === "en" ? "Write command " : "Tulis perintah "}"<span className="text-[#CC66FF]">import</span> <span className="text-[#66FF66]">file-name</span><span className="text-amber-300">=</span>facebook.rsc" {lang === "en" ? "in terminal" : "di terminal"}</p> 
                  <div className="flex flex-col md:flex-row">
                  <img src="/tutorial/9.png" className="w-100 lg:w-130 md:h-10 mt-2 ml-4" alt="" />
                  <img src="/tutorial/10.png" className="w-100 lg:w-130 lg:h-60 mt-2 ml-4" alt="" />
                  </div>
                </li>
                <li className="mt-20">
                  {lang === "en" ? "Check Address List" : "Cek Address List"}
                  <div className="flex flex-col md:flex-row">
                  <img src="/tutorial/11.png" className="w-100 lg:w-130 lg:h-80 mt-2 ml-4" alt="" />
                  <img src="/tutorial/11.1.png" className="w-100 lg:w-130 lg:h-80 mt-2 ml-4" alt="" />
                  </div>
                </li>
                <li className="mt-20">
                  {lang === "en" ? "Create a firewall rule. Set In/Out Interface to the interface that is connected to the network, do the same thing with ipv6":"Buat sebuah rule firewall. Atur In/Out Interface dengan interface yang terkoneksi dengan jaringan internet, lakukan hal yang sama untuk ipv6"
                  }
                  <div className="flex flex-col md:flex-row md:flex-wrap lg:flex-nowrap">
                  <img src="/tutorial/12.png" className="w-100 lg:w-130 h-80 lg:h-80 mt-2 ml-4" alt="" />
                  <img src="/tutorial/13.png" className="w-100 lg:w-130 h-80 lg:h-80 mt-2 ml-4" alt="" />
                  <img src="/tutorial/14.png" className="w-100 lg:w-130 h-80 lg:h-80 mt-2 ml-4" alt="" />
                  </div>
                </li>
                <li className="mt-20">
                  {lang === "en" ? "Result" : "Hasil"}
                  <div className="flex flex-col md:flex-row">
                  <img src="/tutorial/16.png" className="w-100 lg:w-130 md:h-10 mt-2 ml-4" alt="" />
                  <img src="/tutorial/15.png" className="w-100 lg:w-130 lg:h-80 mt-1 ml-4" alt="" />
                  </div>
                </li>
              </ol>
            </div>
            



          </div>
        </section>

        <section className="w-screen h-[4rem] bg-amber-900 flex items-center justify-center">
            <p className="text-slate-300">eilinseth&copy; 2025</p>
        </section>
    </div>
  )
}



export default App
