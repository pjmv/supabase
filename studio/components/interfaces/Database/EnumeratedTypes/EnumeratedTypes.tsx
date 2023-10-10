import { useState } from 'react'

import SchemaSelector from 'components/ui/SchemaSelector'
import {
  EnumeratedType,
  useEnumeratedTypesQuery,
} from 'data/enumerated-types/enumerated-types-query'
import { useProjectContext } from 'components/layouts/ProjectLayout/ProjectContext'
import { GenericSkeletonLoader } from 'components/ui/ShimmeringLoader'
import AlertError from 'components/ui/AlertError'
import Table from 'components/to-be-cleaned/Table'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  IconEdit,
  IconMoreVertical,
  IconPlus,
  IconSearch,
  IconTrash,
  Input,
} from 'ui'
import DeleteEnumeratedTypeModal from './DeleteEnumeratedTypeModal'
import CreateEnumeratedTypeSidePanel from './CreateEnumeratedTypeSidePanel'
import EditEnumeratedTypeSidePanel from './EditEnumeratedTypeSidePanel'

const EnumeratedTypes = () => {
  const { project } = useProjectContext()
  const [search, setSearch] = useState('')
  const [selectedSchema, setSelectedSchema] = useState('public')
  const [showCreateTypePanel, setShowCreateTypePanel] = useState(false)
  const [selectedTypeToEdit, setSelectedTypeToEdit] = useState<EnumeratedType>()
  const [selectedTypeToDelete, setSelectedTypeToDelete] = useState<EnumeratedType>()

  const { data, error, isLoading, isError, isSuccess } = useEnumeratedTypesQuery({
    projectRef: project?.ref,
    connectionString: project?.connectionString,
  })
  const enumeratedTypes =
    search.length > 0
      ? (data ?? []).filter(
          (x) => x.schema === selectedSchema && x.name.toLowerCase().includes(search.toLowerCase())
        )
      : (data ?? []).filter((x) => x.schema === selectedSchema)

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <SchemaSelector
            className="w-[260px]"
            size="small"
            showError={false}
            selectedSchemaName={selectedSchema}
            onSelectSchema={setSelectedSchema}
          />
          <Input
            size="small"
            value={search}
            className="w-[250px]"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for a type"
            icon={<IconSearch size={14} />}
          />
        </div>
        <Button type="primary" onClick={() => setShowCreateTypePanel(true)}>
          Create type
        </Button>
      </div>

      {isLoading && <GenericSkeletonLoader />}

      {isError && (
        <AlertError error={error} subject="Failed to retrieve database enumerated types" />
      )}

      {isSuccess && (
        <Table
          head={[
            <Table.th key="schema">Schema</Table.th>,
            <Table.th key="name">Name</Table.th>,
            <Table.th key="values">Values</Table.th>,
            <Table.th key="actions" />,
          ]}
          body={
            <>
              {enumeratedTypes.length === 0 && search.length === 0 && (
                <Table.tr>
                  <Table.td colSpan={4}>
                    <p className="text-sm text-foreground">No enumerated types created yet</p>
                    <p className="text-sm text-light">
                      There are no enumerated types found in the schema "{selectedSchema}"
                    </p>
                  </Table.td>
                </Table.tr>
              )}
              {enumeratedTypes.length === 0 && search.length > 0 && (
                <Table.tr>
                  <Table.td colSpan={4}>
                    <p className="text-sm text-foreground">No results found</p>
                    <p className="text-sm text-light">
                      Your search for "{search}" did not return any results
                    </p>
                  </Table.td>
                </Table.tr>
              )}
              {enumeratedTypes.length > 0 &&
                enumeratedTypes.map((type) => (
                  <Table.tr key={type.id}>
                    <Table.td className="w-20">
                      <p className="w-20 truncate">{type.schema}</p>
                    </Table.td>
                    <Table.td>{type.name}</Table.td>
                    <Table.td>{type.enums.join(', ')}</Table.td>
                    <Table.td>
                      <div className="flex justify-end items-center space-x-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button
                              asChild
                              type="default"
                              icon={<IconMoreVertical />}
                              className="px-1"
                            >
                              <span></span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="bottom" align="end" className="w-32">
                            <DropdownMenuItem
                              className="space-x-2"
                              onClick={() => setSelectedTypeToEdit(type)}
                            >
                              <IconEdit size="tiny" />
                              <p>Update type</p>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="space-x-2"
                              onClick={() => setSelectedTypeToDelete(type)}
                            >
                              <IconTrash stroke="red" size="tiny" />
                              <p>Delete type</p>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Table.td>
                  </Table.tr>
                ))}
            </>
          }
        />
      )}

      <CreateEnumeratedTypeSidePanel
        visible={showCreateTypePanel}
        onClose={() => setShowCreateTypePanel(false)}
      />

      <EditEnumeratedTypeSidePanel
        visible={selectedTypeToEdit !== undefined}
        selectedEnumeratedType={selectedTypeToEdit}
        onClose={() => setSelectedTypeToEdit(undefined)}
      />

      <DeleteEnumeratedTypeModal
        visible={selectedTypeToDelete !== undefined}
        selectedEnumeratedType={selectedTypeToDelete}
        onClose={() => setSelectedTypeToDelete(undefined)}
      />
    </>
  )
}

export default EnumeratedTypes