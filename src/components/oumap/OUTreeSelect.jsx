import React, { Component } from "react";
import TreeSelect from "rc-tree-select";
import { API_VERSION } from "../ImportData/Constants";
import "rc-tree-select/assets/index.css";
export default class OUTreeSelect extends Component {
    state = {
        oUlist: [],
        currentValue: this.props.value || "",
        treeExpandedKeys: [],
        searchValue: "",
        lv: { value: "", label: "" },
    };
    componentDidMount() {
        this.fetchRoot();
    }
    // first fetch using
    // http://192.168.56.106:8080/api/27/organisationUnits.json?fields=id,path,displayName,children::isNotEmpty&level=1&paging=false
    fetchRoot = async () => {
        try {
            const d2 = this.props.d2;
            const orgUnitTree = await d2.models.organisationUnits
                .list({
                    level: 1,
                    paging: false,
                    fields: "id,path,displayName,leaf,children::isNotEmpty",
                })
                .then(root => root.toArray())
                .then(root => root.filter(list => list.id === "b3aCK1PTn5S"));
            // console.log("Data:" + JSON.stringify(orgUnitTree));
            this.setState({
                oUlist: orgUnitTree.map(item => {
                    const { path, displayName, leaf } = item;
                    return {
                        open: false,
                        key: path,
                        value: path,
                        label: displayName,
                        children: [],
                        isLeaf: leaf,
                    };
                }),
            });
        } catch (e) {
            console.log("OrgUnitTree root fetch failed");
        }
    };
    fetchNode = async path => {
        try {
            const params = [];
            const id = path.substr(path.lastIndexOf("/") + 1);
            params.push("filter=" + encodeURIComponent(`id:in:[${id}]`));
            params.push(
                "fields=" +
                    encodeURIComponent(
                        ":all,displayName,path,children[id,displayName,path,leaf,children::isNotEmpty]"
                    )
            );
            params.push("paging=false");
            params.push("format=json");
            const api = this.props.d2.Api.getApi();
            const { organisationUnits } = await api.get(
                `${API_VERSION}/organisationUnits?${params.join("&")}`
            );
            const { children } = organisationUnits[0];

            const items = children.map(({ id, path, displayName, children, leaf }) => ({
                open: false,
                key: path,
                value: path,
                label: displayName,
                children: children ? [] : null,
                isLeaf: leaf,
            }));
            items.sort((a, b) => a.label.localeCompare(b.label));

            const { oUlist } = this.state;
            this.setChildren(path, items, oUlist);
            this.setState({
                oUlist: [...oUlist],
            });
        } catch (e) {
            console.log("OrgUnitTree fetchNode failed");
            console.log(e);
        }
    };
    fetchNodeForSearch = async path => {
        try {
            const api = this.props.d2.Api.getApi();
            const params = [];
            // const id = path.substr(path.lastIndexOf("/") + 1);
            params.push("filter=" + encodeURIComponent(`id:in:[${path}]`));
            params.push(
                "fields=" +
                    encodeURIComponent(
                        ":all,displayName,path,children[id,displayName,path,leaf,children::isNotEmpty]"
                    )
            );
            params.push("paging=false");
            params.push("format=json");

            const { organisationUnits } = await api.get(
                `${API_VERSION}/organisationUnits?${params.join("&")}`
            );
            for (let index = 0; index < organisationUnits.length; index++) {
                const { children } = organisationUnits[index];

                const items = children.map(({ path, displayName, children, leaf }) => ({
                    open: false,
                    key: path,
                    value: path,
                    label: displayName,
                    children: children ? [] : null,
                    isLeaf: leaf,
                }));
                items.sort((a, b) => a.label.localeCompare(b.label));

                const { oUlist } = this.state;
                this.setChildren(path, items, oUlist);
                this.setState({
                    oUlist: [...oUlist],
                });
            }
        } catch (e) {
            console.log("OrgUnitTree fetchNode failed");
            console.log(e);
        }
    };
    searchOrgUnit = async searchTerm => {
        try {
            // http://192.168.56.106:8080/api/27/organisationUnits?
            //fields=id,parent[id,displayName,path,children,leaf],displayName,path,leaf,children::isNotEmpty,access&query=E&
            //withinUserHierarchy=true&pageSize=15
            const api = this.props.d2.Api.getApi();
            const params = [];
            // const id = path.substr(path.lastIndexOf('/') + 1)
            // params.push('filter=' + encodeURIComponent(`id:in:[${id}]`))
            params.push(
                "fields=" +
                    encodeURIComponent(
                        "id,parent[id,displayName,path,children,leaf],displayName,path,leaf,children::isNotEmpty"
                    )
            );
            params.push(`query=${searchTerm}`);
            params.push("pageSize=15");
            params.push("withinUserHierarchy=true");
            params.push("format=json");

            const { organisationUnits } = await api.get(
                `${API_VERSION}/organisationUnits?${params.join("&")}`
            );
            let items = [];
            this.setState({
                oUlist: [], //[...oUlist],
            });
            organisationUnits.forEach(element => {
                // items.push(element.id)

                const par = [element.parent];
                const childParent = par.map(({ id, path, displayName, leaf }) => ({
                    open: true,
                    key: "P@" + path,
                    value: "P@" + path,
                    label: displayName,
                    isLeaf: leaf,
                    children: [],
                }));
                // console.error('childParent:' + JSON.stringify(childParent))
                const child = {
                    open: false,
                    key: "C@" + element.path,
                    value: "C@" + element.path,
                    label: element.displayName,
                    children: [], // element.children ? [] : null,
                    isLeaf: element.leaf,
                };

                let itemIndex = -1;
                for (const [index, element] of items.entries()) {
                    // console.log(index, element)
                    // check if the current parent is a child of an element in the list

                    if (element.key === childParent[0].key) itemIndex = index;
                }

                if (itemIndex !== -1) {
                    if (items[itemIndex].children.filter(c => c.key === child.key).length === 0) {
                        items[itemIndex].children.push(child);
                    }
                } else {
                    if (childParent[0].children.filter(c => c.key === child.key).length === 0) {
                        childParent[0].children.push(child);
                    }
                    if (items.filter(item => item.key === childParent[0].key).length === 0)
                        items.push(childParent[0]);
                    else console.log("remove item:", childParent[0]);
                }

                // items.push(child)
                // const { oUlist } = this.state;
                // this.setChildren(element.path, items, oUlist)
            });
            // console.log('Items:' + JSON.stringify(items))

            this.setState({
                oUlist: items, //[...oUlist],
            });
            // this.fetchNodeForSearch(items)
        } catch (e) {
            console.log("OrgUnitTree fetchNode failed");
            console.log(e);
        }
    };
    setChildren(path, children, list) {
        if (!Array.isArray(list)) {
            return;
        }

        for (let i = 0; i < list.length; i += 1) {
            if (list[i]["value"] === path) {
                list[i]["children"] = children.slice(0);
                return;
            }

            if (list[i]["children"] && list[i]["children"].length > 0) {
                this.setChildren(path, children, list[i]["children"]);
            }
        }
    }
    // on searching...
    // http://192.168.56.106:8080/api/27/organisationUnits?fields=id,parent[id,displayName,path,children,access],displayName,path,children::isNotEmpty,access&query=E&withinUserHierarchy=true&pageSize=15
    onSearch = (value, ...args) => {
        // this.setState({
        //     oUlist: [],
        // })

        if (value.length === 0) this.fetchRoot();
        else this.searchOrgUnit(value);
        this.setState({ searchValue: value });
        // console.log("Do Search:", value, ...args);
    };

    onChange = (value, ...rest) => {
        // console.log("onChange", value, rest[1]["selected"]);
        // console.warn("onChange", value, ...rest);
        // const oUlist = this.state;
        //  this.setState({ currentValue: rest[0] });
        // console.warn(this.state);
        this.props.onChange(value, ...rest);
    };
    // onChangeLV = (value, ...args) => {
    //     console.log('labelInValue', value, ...args);
    //     if (!value) {
    //       this.setState({ lv: undefined });
    //       return;
    //     }
    //     const path = findPath(value.value, gData)
    //       .map(i => i.label)
    //       .reverse()
    //       .join(' > ');
    //     this.setState({ lv: { value: value.value, label: value.label } });
    //   };
    onTreeExpand = treeExpandedKeys => {
        console.log("treeExpandedKeys", treeExpandedKeys);
        if (treeExpandedKeys.length > 0)
            this.fetchNode(treeExpandedKeys[treeExpandedKeys.length - 1]);
        this.setState({
            treeExpandedKeys,
        });
    };

    render() {
        const { oUlist, searchValue } = this.state;
        return (
            <TreeSelect
                style={{ width: 300 }}
                transitionName="rc-tree-select-dropdown-slide-up"
                choiceTransitionName="rc-tree-select-selection__choice-zoom"
                dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                placeholder={<i>Select OUs</i>}
                searchPlaceholder="Type here to start searching..."
                showSearch
                allowClear
                // treeExpandedKeys={treeExpandedKeys}
                treeLine
                onTreeExpand={this.onTreeExpand}
                searchValue={searchValue}
                value={this.props.value}
                treeData={oUlist}
                treeNodeFilterProp="label"
                filterTreeNode={false}
                onSearch={this.onSearch}
                // open={tsOpen}
                onChange={this.onChange}
                // onSelect={this.onSelect}
                // treeCheckable
                // treeDefaultExpandAll
                // onDropdownVisibleChange={(v, info) => {
                //     console.log('single onDropdownVisibleChange', v, info)
                //     // document clicked
                //     if (
                //         info.documentClickClose &&
                //         currentValue === '0-0-0-0-value'
                //     ) {
                //         return false
                //     }
                //     this.setState({
                //         tsOpen: v,
                //     })
                //     return true
                // }}
            />
        );
    }
}
