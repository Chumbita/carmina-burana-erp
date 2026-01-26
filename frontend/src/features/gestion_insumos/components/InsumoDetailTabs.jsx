import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { InsumoDetailTable } from './InsumoDetailTable'
import { Link } from 'react-router-dom'

export function TabsDetailInsumo({ insumo }){


    const tabs = [
  {
    name: 'Insumos',
    value: 'insumos',
    content: (
      <>
          <InsumoDetailTable insumo={insumo} />
      </>
    )
  },
  {
    name: 'Lotes',
    value: 'lotes',
    content: (
      <>
      <p>Tabla global de lotes</p>
      </>
    )
  },
  {
    name: 'Historial',
    value: 'historial',
    content: (
      <>

      <p>Historial de movimientos</p>
      </>
    )
  }
]


  return (
    <div className='w-full max-w-dvw'>
      <Tabs defaultValue='insumos' className='gap-4'>
        <TabsList className='bg-background rounded-none border-b p-0'>
          {tabs.map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className='bg-background data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none'
            >
              {tab.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map(tab => (
          <TabsContent key={tab.value} value={tab.value}>
            <p className='text-muted-foreground text-sm'>{tab.content}</p>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}


