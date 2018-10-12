<a name="top"></a>
# MapRules UI v0.0.1

UI for Creating Custom Mapping Presets and Validation rules

- [CreateMapRule](#createmaprule)
	- [Create new MapRules config](#create-new-maprules-config)
	
- [EditMapRule](#editmaprule)
	- [Edit MapRules config](#edit-maprules-config)
	
- [ViewMapRule](#viewmaprule)
	- [Start Editors with MapRules](#start-editors-with-maprules)
	- [View MapRules instructions](#view-maprules-instructions)
	


# <a name='createmaprule'></a> CreateMapRule

## <a name='create-new-maprules-config'></a> Create new MapRules config
[Back to top](#top)



	GET /new







# <a name='editmaprule'></a> EditMapRule

## <a name='edit-maprules-config'></a> Edit MapRules config
[Back to top](#top)



	GET /:id/edit





### Path Param Parameters

| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
|  id | String | <p>MapRules configuration id</p>|

### Query Parameters Parameters

| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
|  name | String | <p>MapRules name initializes to this value</p>|




# <a name='viewmaprule'></a> ViewMapRule

## <a name='start-editors-with-maprules'></a> Start Editors with MapRules
[Back to top](#top)



	GET /:id/start





### Parameter Parameters

| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
|  id | String | <p>MapRules configuration id</p>|




## <a name='view-maprules-instructions'></a> View MapRules instructions
[Back to top](#top)



	GET /:id/instructions





### Parameter Parameters

| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
|  id | String | <p>MapRules configuration id</p>|




