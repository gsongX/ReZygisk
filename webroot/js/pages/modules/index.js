import { exec, toast } from '../../kernelsu.js'

import { whichCurrentPage } from '../navbar.js'
import { getStrings } from '../pageLoader.js'

async function _getReZygiskState() {
  let stateCmd = await exec('/system/bin/cat /data/adb/rezygisk/state.json')
  if (stateCmd.errno !== 0) {
    toast('Error getting state of ReZygisk!')

    return;
  }

  try {
    const ReZygiskState = JSON.parse(stateCmd.stdout)
    return ReZygiskState
  } catch {
    return null;
  }
}

async function _getModuleBadge(modName) {
  const r = await exec("/system/bin/test -f '/data/adb/modules/" + modName + "/disable'")
  const disabled = r.errno === 0
  const badge = document.createElement('span')
  badge.className = disabled ? 'badge badge-disabled' : 'badge badge-enabled'
  badge.textContent = disabled ? 'Disabled' : 'Enabled'
  return badge
}

async function _getModuleNames(modules) {
  const fullCommand = modules.map((mod) => {
    const propPath = `/data/adb/modules/${mod.id}/module.prop`

    return `printf % ; if test -f "${propPath}"; then /system/bin/grep '^name=' "${propPath}" | /system/bin/cut -d '=' -f 2- 2>/dev/null || true; else true; fi ; printf "\\n"`
  }).join(' ; ')

  const result = await exec(fullCommand)
  if (result.errno !== 0) {
    setError('getModuleNames', 'Failed to execute command to retrieve module list names')

    return null
  }

  return result.stdout.split('\n\n')
}

async function _updateDynamicElement() {
  const ReZygiskState = await _getReZygiskState()
  const all_modules = []
  const strings = await getStrings(whichCurrentPage())

  if (ReZygiskState.rezygiskd) Object.keys(ReZygiskState.rezygiskd).forEach((daemon_bit) => {
    const daemon = ReZygiskState.rezygiskd[daemon_bit]

    if (daemon.modules && daemon.modules.length > 0) {
      daemon.modules.forEach((module_id) => {
        const module = all_modules.find((mod) => mod.id === module_id)
        if (module) {
          module.bitsUsed.push(daemon_bit)
        } else {
          all_modules.push({
            id: module_id,
            name: null,
            bitsUsed: [ daemon_bit ]
          })
        }
      })
    }
  })

  if (all_modules.length !== 0) {
    const modules_list = document.getElementById('modules_list')

    const notAvailable = document.createElement('div')
    notAvailable.id = 'modules_list_not_avaliable'
    notAvailable.className = 'not_avaliable'
    notAvailable.textContent = strings.notAvaliable
    notAvailable.style.display = 'none'
    modules_list.replaceChildren(notAvailable)

    const module_names = await _getModuleNames(all_modules)
    module_names.forEach((module_name, i) => all_modules[i].name = module_name)

    for (const module of all_modules) {
      const badge = await _getModuleBadge(module.id)

      const nameSpan = document.createElement('span')
      nameSpan.textContent = module.name

      const topRow = document.createElement('div')
      topRow.className = 'dimc'
      topRow.style.cssText = 'font-size: 1.1em; display: flex; align-items: center; gap: 8px;'
      topRow.appendChild(nameSpan)
      topRow.appendChild(badge)

      const archLabel = document.createElement('div')
      archLabel.className = 'dimc arch_desc'
      archLabel.textContent = strings.arch

      const bitsValue = document.createElement('div')
      bitsValue.className = 'dimc'
      bitsValue.style.marginLeft = '5px'
      bitsValue.textContent = module.bitsUsed.join(' / ')

      const bottomRow = document.createElement('div')
      bottomRow.className = 'dimc desc'
      bottomRow.style.cssText = 'font-size: 0.9em; margin-top: 3px; white-space: nowrap; align-items: center; display: flex;'
      bottomRow.appendChild(archLabel)
      bottomRow.appendChild(bitsValue)

      const card = document.createElement('div')
      card.className = 'dim card'
      card.style.cssText = 'padding: 25px 15px; cursor: pointer;'
      card.appendChild(topRow)
      card.appendChild(bottomRow)

      modules_list.appendChild(card)
    }
  }
}

export async function loadOnce() {

}

export async function loadOnceView() {
  await _updateDynamicElement()
}

export async function onceViewAfterUpdate() {
  await _updateDynamicElement()
}

export async function load() {

}
